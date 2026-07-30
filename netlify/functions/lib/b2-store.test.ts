import { describe, expect, it } from "vitest";
import { readB2Config } from "./b2-store";

describe("readB2Config", () => {
  it("rejects incomplete configuration without revealing supplied values", () => {
    expect(() => readB2Config({ B2_KEY_ID: "do-not-print" })).toThrow(
      "B2 connection is not configured"
    );
  });

  it("returns only the required private-bucket connection fields", () => {
    expect(
      readB2Config({
        B2_ENDPOINT: "https://s3.example.invalid",
        B2_REGION: "us-west-000",
        B2_BUCKET: "dream-vault",
        B2_KEY_ID: "key-id",
        B2_APPLICATION_KEY: "secret"
      })
    ).toEqual({
      endpoint: "https://s3.example.invalid",
      region: "us-west-000",
      bucket: "dream-vault",
      keyId: "key-id",
      applicationKey: "secret"
    });
  });
});
