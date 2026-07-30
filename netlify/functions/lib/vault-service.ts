import { createHash, randomUUID } from "node:crypto";
import {
  sanitizeTitle,
  validateGenblazeManifest,
  validateImageBytes,
  type ProofManifest,
  type SupportedContentType
} from "../../../src/domain/proof";

const ARTIFACT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ObjectStore {
  put(
    key: string,
    body: Uint8Array | string,
    contentType: string
  ): Promise<void>;
  getText(key: string): Promise<string | null>;
  signedGetUrl(key: string, expiresSeconds: number): Promise<string>;
}

export interface CreateProofInput {
  base64: string;
  contentType: string;
  title: string;
  consentAccepted: boolean;
  genblazeManifest: string;
}

export interface CreateProofResult {
  manifest: ProofManifest;
}

function decodeBase64(base64: string): Uint8Array {
  if (!base64 || typeof base64 !== "string") {
    throw new Error("missing image payload");
  }
  return Uint8Array.from(Buffer.from(base64, "base64"));
}

function assertArtifactId(value: string): void {
  if (!ARTIFACT_ID_PATTERN.test(value)) {
    throw new Error("invalid artifact id");
  }
}

export async function createProof(
  store: ObjectStore,
  input: CreateProofInput,
  makeId: () => string = randomUUID,
  now: () => Date = () => new Date()
): Promise<CreateProofResult> {
  if (!input.consentAccepted) {
    throw new Error("consent required");
  }

  const bytes = validateImageBytes(
    decodeBase64(input.base64),
    input.contentType
  );
  const serverHash = createHash("sha256").update(bytes).digest("hex");
  const genblaze = validateGenblazeManifest(
    input.genblazeManifest,
    serverHash
  );
  const artifactId = makeId();
  assertArtifactId(artifactId);

  const contentType = input.contentType as SupportedContentType;
  const extension = contentType === "image/png" ? "png" : "webp";
  const imageObjectKey = `artifacts/${artifactId}/card.${extension}`;
  const genblazeObjectKey =
    `artifacts/${artifactId}/genblaze-manifest.json`;
  const manifestObjectKey = `artifacts/${artifactId}/manifest.json`;
  const manifest: ProofManifest = {
    schemaVersion: "doream.proof.v1",
    artifactId,
    title: sanitizeTitle(input.title),
    file: {
      sha256: serverHash,
      bytes: bytes.length,
      contentType
    },
    provenance: {
      createdAt: now().toISOString(),
      source: "doream-dream-card-export",
      consentVersion: "2026-07-30"
    },
    storage: {
      provider: "Backblaze B2",
      imageObjectKey,
      manifestObjectKey,
      genblazeObjectKey
    },
    genblaze
  };

  await store.put(imageObjectKey, bytes, contentType);
  await store.put(
    genblazeObjectKey,
    input.genblazeManifest,
    "application/json"
  );
  await store.put(
    manifestObjectKey,
    JSON.stringify(manifest, null, 2),
    "application/json"
  );

  return { manifest };
}

export async function getProof(
  store: ObjectStore,
  artifactId: string
): Promise<{ manifest: ProofManifest; imageUrl: string }> {
  assertArtifactId(artifactId);
  const manifestKey = `artifacts/${artifactId}/manifest.json`;
  const serialized = await store.getText(manifestKey);
  if (!serialized) {
    throw new Error("proof not found");
  }

  const manifest = JSON.parse(serialized) as ProofManifest;
  if (
    manifest.artifactId !== artifactId ||
    !manifest.storage?.imageObjectKey?.startsWith(`artifacts/${artifactId}/`) ||
    !manifest.storage?.genblazeObjectKey?.startsWith(
      `artifacts/${artifactId}/`
    ) ||
    manifest.genblaze?.verified !== true
  ) {
    throw new Error("invalid proof manifest");
  }

  const imageUrl = await store.signedGetUrl(
    manifest.storage.imageObjectKey,
    900
  );
  return { manifest, imageUrl };
}
