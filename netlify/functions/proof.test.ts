import { describe, expect, it } from "vitest";
import { createProof } from "./lib/vault-service";
import { TestMemoryStore } from "./lib/test-memory-store";
import { config, makeProofHandler } from "./proof";

const artifactId = "11111111-1111-4111-8111-111111111111";
const pngBase64 = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
]).toString("base64");
const genblazeManifest = JSON.stringify({
  canonical_hash: "c".repeat(64),
  verified: true,
  run: {
    status: "completed",
    steps: [
      {
        status: "succeeded",
        prompt: "[private prompt redacted]",
        assets: [{ sha256: "b".repeat(64) }]
      },
      {
        status: "succeeded",
        prompt: "Render a privacy-safe Dream Card",
        assets: [
          {
            sha256:
              "4c4b6a3be1314ab86138bef4314dde022e600960d8689a2c8f8631802d20dab6"
          }
        ]
      }
    ]
  }
});

describe("proof handler", () => {
  it("rate-limits proof reads without blocking a normal demo", () => {
    expect(config.rateLimit).toEqual({
      windowLimit: 60,
      windowSize: 60,
      aggregateBy: ["ip", "domain"]
    });
  });

  it("returns a sanitized manifest and signed image URL", async () => {
    const store = new TestMemoryStore();
    await createProof(
      store,
      {
        base64: pngBase64,
        contentType: "image/png",
        title: "Moon platform",
        consentAccepted: true,
        genblazeManifest
      },
      () => artifactId
    );

    const response = await makeProofHandler(store)(
      {
        httpMethod: "GET",
        queryStringParameters: { id: artifactId }
      } as never,
      {} as never
    );

    expect(response).toMatchObject({ statusCode: 200 });
    const payload = JSON.parse((response as { body: string }).body);
    expect(payload.manifest.artifactId).toBe(artifactId);
    expect(payload.imageUrl).toContain("expires=900");
  });

  it("returns 404 for a well-formed unknown proof id", async () => {
    const response = await makeProofHandler(new TestMemoryStore())(
      {
        httpMethod: "GET",
        queryStringParameters: { id: artifactId }
      } as never,
      {} as never
    );

    expect(response).toMatchObject({ statusCode: 404 });
  });
});
