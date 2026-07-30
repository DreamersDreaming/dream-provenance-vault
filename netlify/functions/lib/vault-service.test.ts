import { describe, expect, it } from "vitest";
import {
  createProof,
  getProof,
  type ObjectStore
} from "./vault-service";

const pngBytes = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
]);
const pngSha256 =
  "4c4b6a3be1314ab86138bef4314dde022e600960d8689a2c8f8631802d20dab6";
const canonicalHash = "c".repeat(64);

function genblazeManifest(finalSha256 = pngSha256): string {
  return JSON.stringify({
    canonical_hash: canonicalHash,
    verified: true,
    run: {
      status: "completed",
      steps: [
        {
          status: "succeeded",
          prompt: "[private prompt redacted]",
          assets: [
            {
              sha256: "b".repeat(64),
              url: "https://doream.org/provenance/synthetic-source"
            }
          ]
        },
        {
          status: "succeeded",
          prompt: "Render a privacy-safe Dream Card",
          assets: [
            {
              sha256: finalSha256,
              url: "https://doream.org/provenance/dream-card"
            }
          ]
        }
      ]
    }
  });
}

class MemoryStore implements ObjectStore {
  private readonly objects = new Map<
    string,
    { body: Uint8Array; contentType: string }
  >();

  async put(
    key: string,
    body: Uint8Array | string,
    contentType: string
  ): Promise<void> {
    const bytes =
      typeof body === "string" ? new TextEncoder().encode(body) : body;
    this.objects.set(key, { body: bytes, contentType });
  }

  async getText(key: string): Promise<string | null> {
    const found = this.objects.get(key);
    return found ? new TextDecoder().decode(found.body) : null;
  }

  async signedGetUrl(key: string, expiresSeconds: number): Promise<string> {
    return `https://signed.example/${key}?expires=${expiresSeconds}`;
  }

  keys(): string[] {
    return [...this.objects.keys()];
  }
}

describe("createProof", () => {
  it("stores the card and sanitized manifest using the server hash", async () => {
    const store = new MemoryStore();
    const result = await createProof(
      store,
      {
        base64: Buffer.from(pngBytes).toString("base64"),
        contentType: "image/png",
        title: "  Moon   platform  ",
        consentAccepted: true,
        genblazeManifest: genblazeManifest()
      },
      () => "11111111-1111-4111-8111-111111111111",
      () => new Date("2026-07-30T00:00:00Z")
    );

    expect(result.manifest.title).toBe("Moon platform");
    expect(result.manifest.file.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(result.manifest.file.bytes).toBe(pngBytes.length);
    expect(result.manifest.provenance.createdAt).toBe(
      "2026-07-30T00:00:00.000Z"
    );
    expect(result.manifest.genblaze).toEqual({
      canonicalHash,
      verified: true,
      stepCount: 2
    });
    expect(store.keys()).toEqual([
      "artifacts/11111111-1111-4111-8111-111111111111/card.png",
      "artifacts/11111111-1111-4111-8111-111111111111/genblaze-manifest.json",
      "artifacts/11111111-1111-4111-8111-111111111111/manifest.json"
    ]);
  });

  it("does not contact storage without explicit consent", async () => {
    const store = new MemoryStore();
    await expect(
      createProof(store, {
        base64: Buffer.from(pngBytes).toString("base64"),
        contentType: "image/png",
        title: "Moon platform",
        consentAccepted: false,
        genblazeManifest: genblazeManifest()
      })
    ).rejects.toThrow("consent required");
    expect(store.keys()).toEqual([]);
  });

  it("rejects a Genblaze lineage for different bytes before storage", async () => {
    const store = new MemoryStore();
    await expect(
      createProof(store, {
        base64: Buffer.from(pngBytes).toString("base64"),
        contentType: "image/png",
        title: "Moon platform",
        consentAccepted: true,
        genblazeManifest: genblazeManifest("a".repeat(64))
      })
    ).rejects.toThrow("final asset hash mismatch");
    expect(store.keys()).toEqual([]);
  });
});

describe("getProof", () => {
  it("reads the private manifest and returns a short-lived image URL", async () => {
    const store = new MemoryStore();
    const artifactId = "11111111-1111-4111-8111-111111111111";
    await createProof(
      store,
      {
        base64: Buffer.from(pngBytes).toString("base64"),
        contentType: "image/png",
        title: "Moon platform",
        consentAccepted: true,
        genblazeManifest: genblazeManifest()
      },
      () => artifactId
    );

    const proof = await getProof(store, artifactId);
    expect(proof.imageUrl).toContain(
      `artifacts/${artifactId}/card.png?expires=900`
    );
    expect(proof.manifest.artifactId).toBe(artifactId);
  });

  it("rejects malformed identifiers before storage lookup", async () => {
    await expect(getProof(new MemoryStore(), "../secret")).rejects.toThrow(
      "invalid artifact id"
    );
  });
});
