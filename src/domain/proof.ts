export const MAX_CARD_BYTES = 5 * 1024 * 1024;
export const SUPPORTED_CONTENT_TYPES = ["image/png", "image/webp"] as const;

export type SupportedContentType = (typeof SUPPORTED_CONTENT_TYPES)[number];

export interface ProofManifest {
  schemaVersion: "doream.proof.v1";
  artifactId: string;
  title: string;
  file: {
    sha256: string;
    bytes: number;
    contentType: SupportedContentType;
  };
  provenance: {
    createdAt: string;
    source: "doream-dream-card-export";
    consentVersion: "2026-07-30";
  };
  storage: {
    provider: "Backblaze B2";
    imageObjectKey: string;
    manifestObjectKey: string;
    genblazeObjectKey: string;
  };
  genblaze: {
    canonicalHash: string;
    verified: true;
    stepCount: number;
  };
}

export interface GenblazeManifestSummary {
  canonicalHash: string;
  verified: true;
  stepCount: number;
}

interface GenblazeAsset {
  sha256?: unknown;
  url?: unknown;
}

interface GenblazeStep {
  status?: unknown;
  prompt?: unknown;
  assets?: unknown;
}

interface GenblazeEnvelope {
  canonical_hash?: unknown;
  verified?: unknown;
  run?: {
    status?: unknown;
    steps?: unknown;
  };
}

const SHA256_PATTERN = /^[a-f0-9]{64}$/;

const PNG_SIGNATURE = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
]);
const RIFF_SIGNATURE = Uint8Array.from([0x52, 0x49, 0x46, 0x46]);
const WEBP_SIGNATURE = Uint8Array.from([0x57, 0x45, 0x42, 0x50]);

function matchesAt(
  bytes: Uint8Array,
  signature: Uint8Array,
  offset = 0
): boolean {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

export function isSupportedContentType(
  value: string
): value is SupportedContentType {
  return SUPPORTED_CONTENT_TYPES.includes(value as SupportedContentType);
}

export function validateImageBytes(
  bytes: Uint8Array,
  contentType: string
): Uint8Array {
  if (!isSupportedContentType(contentType)) {
    throw new Error("unsupported content type");
  }

  if (bytes.length === 0 || bytes.length > MAX_CARD_BYTES) {
    throw new Error("invalid file size");
  }

  const validSignature =
    contentType === "image/png"
      ? matchesAt(bytes, PNG_SIGNATURE)
      : matchesAt(bytes, RIFF_SIGNATURE) &&
        matchesAt(bytes, WEBP_SIGNATURE, 8);

  if (!validSignature) {
    throw new Error("binary signature mismatch");
  }

  return bytes;
}

export function sanitizeTitle(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim().slice(0, 60);
  return normalized || "Untitled Dream Card";
}

export function validateGenblazeManifest(
  serialized: string,
  expectedFinalSha256: string
): GenblazeManifestSummary {
  let parsed: GenblazeEnvelope;
  try {
    parsed = JSON.parse(serialized) as GenblazeEnvelope;
  } catch {
    throw new Error("invalid Genblaze manifest JSON");
  }

  if (
    parsed.verified !== true ||
    typeof parsed.canonical_hash !== "string" ||
    !SHA256_PATTERN.test(parsed.canonical_hash) ||
    parsed.run?.status !== "completed" ||
    !Array.isArray(parsed.run.steps) ||
    parsed.run.steps.length < 2
  ) {
    throw new Error("unverified Genblaze manifest");
  }

  const steps = parsed.run.steps as GenblazeStep[];
  if (
    steps.some(
      (step) =>
        step.status !== "succeeded" ||
        !Array.isArray(step.assets) ||
        step.assets.length === 0
    )
  ) {
    throw new Error("incomplete Genblaze lineage");
  }

  if (steps[0]?.prompt !== "[private prompt redacted]") {
    throw new Error("private Genblaze prompt must be redacted");
  }

  const assets = steps.flatMap((step) => step.assets as GenblazeAsset[]);
  if (
    assets.some(
      (asset) =>
        typeof asset.url === "string" &&
        (/^file:/i.test(asset.url) || /^[A-Z]:[\\/]/i.test(asset.url))
    )
  ) {
    throw new Error("local paths are not allowed in the Genblaze manifest");
  }

  const finalAssets = steps.at(-1)?.assets as GenblazeAsset[];
  const finalMatches = finalAssets.some(
    (asset) =>
      typeof asset.sha256 === "string" &&
      asset.sha256.toLowerCase() === expectedFinalSha256.toLowerCase()
  );
  if (!SHA256_PATTERN.test(expectedFinalSha256.toLowerCase()) || !finalMatches) {
    throw new Error("Genblaze final asset hash mismatch");
  }

  return {
    canonicalHash: parsed.canonical_hash,
    verified: true,
    stepCount: steps.length
  };
}

export async function sha256Bytes(bytes: Uint8Array): Promise<string> {
  const safeCopy = Uint8Array.from(bytes);
  const digest = await crypto.subtle.digest("SHA-256", safeCopy);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
