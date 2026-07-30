// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App, type VaultApi } from "./App";

const localHash = "a".repeat(64);
const genblazeHash = "c".repeat(64);
const pngFile = new File(
  [
    Uint8Array.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
    ])
  ],
  "moon-platform.png",
  { type: "image/png" }
);

function genblazeFile(finalSha = localHash): File {
  return new File(
    [
      JSON.stringify({
        canonical_hash: genblazeHash,
        verified: true,
        schema_version: "1.5",
        run: {
          name: "dream-provenance-vault",
          status: "completed",
          steps: [
            {
              provider: "doream",
              model: "doream-image-generation",
              modality: "image",
              status: "succeeded",
              prompt: "[private prompt redacted]",
              assets: [{ sha256: "b".repeat(64) }]
            },
            {
              provider: "doream",
              model: "doream-prism-card-renderer",
              modality: "image",
              status: "succeeded",
              prompt:
                "Render a privacy-safe Prism Dream Card from the generated image",
              assets: [{ sha256: finalSha }]
            }
          ]
        }
      })
    ],
    "genblaze-manifest.json",
    { type: "application/json" }
  );
}

function makeApi(serverHash = localHash): VaultApi {
  return {
    createProof: vi.fn().mockResolvedValue({
      proofPath: "/proof/11111111-1111-4111-8111-111111111111",
      manifest: {
        schemaVersion: "doream.proof.v1",
        artifactId: "11111111-1111-4111-8111-111111111111",
        title: "Moon platform",
        file: {
          sha256: serverHash,
          bytes: 8,
          contentType: "image/png"
        },
        provenance: {
          createdAt: "2026-07-30T00:00:00.000Z",
          source: "doream-dream-card-export",
          consentVersion: "2026-07-30"
        },
        storage: {
          provider: "Backblaze B2",
          imageObjectKey:
            "artifacts/11111111-1111-4111-8111-111111111111/card.png",
          manifestObjectKey:
            "artifacts/11111111-1111-4111-8111-111111111111/manifest.json",
          genblazeObjectKey:
            "artifacts/11111111-1111-4111-8111-111111111111/genblaze-manifest.json"
        },
        genblaze: {
          canonicalHash: genblazeHash,
          verified: true,
          stepCount: 2
        }
      }
    }),
    getProof: vi.fn()
  };
}

afterEach(() => {
  window.history.replaceState({}, "", "/");
});

describe("Dream Provenance Vault", () => {
  it("keeps B2 storage disabled until a card, Genblaze manifest, and consent exist", async () => {
    const user = userEvent.setup();
    render(<App api={makeApi()} hashFile={async () => localHash} />);

    const button = screen.getByRole("button", {
      name: /create b2 proof/i
    });
    expect(button).toBeDisabled();

    await user.upload(screen.getByLabelText(/choose dream card/i), pngFile);
    await waitFor(() => expect(screen.getByText(localHash)).toBeInTheDocument());
    expect(button).toBeDisabled();

    await user.click(
      screen.getByRole("checkbox", { name: /i understand/i })
    );
    expect(button).toBeDisabled();

    await user.upload(
      screen.getByLabelText(/choose genblaze manifest/i),
      genblazeFile()
    );
    await waitFor(() =>
      expect(screen.getByText(genblazeHash)).toBeInTheDocument()
    );
    expect(button).toBeEnabled();
  });

  it("renders a receipt only when the local and server hashes match", async () => {
    const user = userEvent.setup();
    render(<App api={makeApi()} hashFile={async () => localHash} />);

    await user.upload(screen.getByLabelText(/choose dream card/i), pngFile);
    await user.upload(
      screen.getByLabelText(/choose genblaze manifest/i),
      genblazeFile()
    );
    await user.click(
      screen.getByRole("checkbox", { name: /i understand/i })
    );
    await user.click(
      screen.getByRole("button", { name: /create b2 proof/i })
    );

    expect(
      await screen.findByRole("heading", { name: /b2 proof created/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Backblaze B2")).toBeInTheDocument();
    expect(screen.getAllByText(localHash).length).toBeGreaterThan(0);
  });

  it("rejects a server response whose hash does not match the local file", async () => {
    const user = userEvent.setup();
    render(<App api={makeApi("b".repeat(64))} hashFile={async () => localHash} />);

    await user.upload(screen.getByLabelText(/choose dream card/i), pngFile);
    await user.upload(
      screen.getByLabelText(/choose genblaze manifest/i),
      genblazeFile()
    );
    await user.click(
      screen.getByRole("checkbox", { name: /i understand/i })
    );
    await user.click(
      screen.getByRole("button", { name: /create b2 proof/i })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "hash did not match"
    );
    expect(
      screen.queryByRole("heading", { name: /b2 proof created/i })
    ).not.toBeInTheDocument();
  });
});
