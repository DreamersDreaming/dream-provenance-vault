import { describe, expect, it } from "vitest";
import {
  MAX_CARD_BYTES,
  sanitizeTitle,
  sha256Bytes,
  validateGenblazeManifest,
  validateImageBytes
} from "./proof";

const pngHeader = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
]);

const webpHeader = Uint8Array.from([
  0x52, 0x49, 0x46, 0x46,
  0x10, 0x00, 0x00, 0x00,
  0x57, 0x45, 0x42, 0x50
]);

describe("validateImageBytes", () => {
  it("accepts a PNG whose declared type matches its signature", () => {
    expect(validateImageBytes(pngHeader, "image/png")).toEqual(pngHeader);
  });

  it("accepts a WebP whose RIFF container contains the WEBP signature", () => {
    expect(validateImageBytes(webpHeader, "image/webp")).toEqual(webpHeader);
  });

  it("rejects a mismatched binary signature", () => {
    const fake = new TextEncoder().encode("not a png");
    expect(() => validateImageBytes(fake, "image/png")).toThrow(
      "binary signature mismatch"
    );
  });

  it("rejects unsupported content types", () => {
    expect(() => validateImageBytes(pngHeader, "image/jpeg")).toThrow(
      "unsupported content type"
    );
  });

  it("rejects files larger than five MiB", () => {
    const oversized = new Uint8Array(MAX_CARD_BYTES + 1);
    oversized.set(pngHeader);
    expect(() => validateImageBytes(oversized, "image/png")).toThrow(
      "invalid file size"
    );
  });
});

describe("sanitizeTitle", () => {
  it("collapses whitespace and limits the title to 60 characters", () => {
    expect(sanitizeTitle(`  ${"a".repeat(70)} \n dream  `)).toBe(
      "a".repeat(60)
    );
  });

  it("uses a neutral fallback for an empty title", () => {
    expect(sanitizeTitle("   ")).toBe("Untitled Dream Card");
  });
});

describe("sha256Bytes", () => {
  it("returns the lowercase SHA-256 fingerprint of the exact bytes", async () => {
    expect(await sha256Bytes(new TextEncoder().encode("dream"))).toBe(
      "30fde358b34772de141e11ba599e28f9f44aa80ae89aaf243b73e6b9b9ebc896"
    );
  });
});

function genblazeManifest(finalSha256: string, assetUrl = "artifact://card") {
  return JSON.stringify({
    canonical_hash: "c".repeat(64),
    verified: true,
    run: {
      status: "completed",
      steps: [
        {
          status: "succeeded",
          prompt: "[private prompt redacted]",
          assets: [{ sha256: "b".repeat(64), url: "artifact://raw" }]
        },
        {
          status: "succeeded",
          prompt: "Render a privacy-safe Dream Card",
          assets: [{ sha256: finalSha256, url: assetUrl }]
        }
      ]
    }
  });
}

describe("validateGenblazeManifest", () => {
  it("accepts a verified two-step lineage whose final asset matches", () => {
    const finalSha256 = "a".repeat(64);
    expect(
      validateGenblazeManifest(genblazeManifest(finalSha256), finalSha256)
    ).toEqual({
      canonicalHash: "c".repeat(64),
      verified: true,
      stepCount: 2
    });
  });

  it("rejects a lineage for a different final card", () => {
    expect(() =>
      validateGenblazeManifest(
        genblazeManifest("b".repeat(64)),
        "a".repeat(64)
      )
    ).toThrow("final asset hash mismatch");
  });

  it("rejects unredacted source prompts and local file paths", () => {
    const finalSha256 = "a".repeat(64);
    const withPrompt = genblazeManifest(finalSha256).replace(
      "[private prompt redacted]",
      "private dream"
    );
    expect(() =>
      validateGenblazeManifest(withPrompt, finalSha256)
    ).toThrow("must be redacted");

    expect(() =>
      validateGenblazeManifest(
        genblazeManifest(finalSha256, "file:///C:/Users/demo/card.png"),
        finalSha256
      )
    ).toThrow("local paths");
  });
});
