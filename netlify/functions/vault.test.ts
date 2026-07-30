import { describe, expect, it } from "vitest";
import { TestMemoryStore } from "./lib/test-memory-store";
import { makeVaultHandler } from "./vault";

const pngBase64 = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
]).toString("base64");
const pngSha256 =
  "4c4b6a3be1314ab86138bef4314dde022e600960d8689a2c8f8631802d20dab6";
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
        assets: [{ sha256: pngSha256 }]
      }
    ]
  }
});

describe("vault handler", () => {
  it("returns 201 only after all three B2 objects are stored", async () => {
    const store = new TestMemoryStore();
    const handler = makeVaultHandler(store);
    const response = await handler(
      {
        httpMethod: "POST",
        body: JSON.stringify({
          base64: pngBase64,
          contentType: "image/png",
          title: "Moon platform",
          consentAccepted: true,
          genblazeManifest
        })
      } as never,
      {} as never
    );

    expect(response).toMatchObject({ statusCode: 201 });
    expect(store.objects.size).toBe(3);
    const payload = JSON.parse((response as { body: string }).body);
    expect(payload.proofPath).toMatch(/^\/proof\/[0-9a-f-]{36}$/);
  });

  it("returns a privacy-safe 400 response for invalid input", async () => {
    const response = await makeVaultHandler(new TestMemoryStore())(
      {
        httpMethod: "POST",
        body: JSON.stringify({
          base64: "bad",
          contentType: "image/png",
          title: "bad",
          consentAccepted: false
        })
      } as never,
      {} as never
    );

    expect(response).toEqual({
      statusCode: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "The proof request was not valid." })
    });
  });
});
