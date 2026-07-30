import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Netlify function deployment structure", () => {
  it("keeps only valid function entry names at the function root", () => {
    const rootFiles = readdirSync(
      new URL("../netlify/functions/", import.meta.url),
      { withFileTypes: true },
    )
      .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
      .map((entry) => entry.name)
      .sort();

    expect(rootFiles).toEqual(["proof.ts", "vault.ts"]);
  });
});
