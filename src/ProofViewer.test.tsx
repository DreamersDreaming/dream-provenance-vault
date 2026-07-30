// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProofViewer } from "./ProofViewer";
import type { VaultApi } from "./App";

const manifest = {
  schemaVersion: "doream.proof.v1" as const,
  artifactId: "11111111-1111-4111-8111-111111111111",
  title: "Commute Moon Platform",
  file: {
    sha256: "a".repeat(64),
    bytes: 8,
    contentType: "image/png" as const
  },
  provenance: {
    createdAt: "2026-07-30T00:00:00.000Z",
    source: "doream-dream-card-export" as const,
    consentVersion: "2026-07-30" as const
  },
  storage: {
    provider: "Backblaze B2" as const,
    imageObjectKey:
      "artifacts/11111111-1111-4111-8111-111111111111/card.png",
    manifestObjectKey:
      "artifacts/11111111-1111-4111-8111-111111111111/manifest.json",
    genblazeObjectKey:
      "artifacts/11111111-1111-4111-8111-111111111111/genblaze-manifest.json"
  },
  genblaze: {
    canonicalHash: "c".repeat(64),
    verified: true as const,
    stepCount: 2
  }
};

describe("ProofViewer", () => {
  it("renders a sanitized B2 proof and its signed image", async () => {
    const api: VaultApi = {
      createProof: vi.fn(),
      getProof: vi.fn().mockResolvedValue({
        manifest,
        imageUrl: "https://signed.example/card.png"
      })
    };

    render(<ProofViewer api={api} artifactId={manifest.artifactId} />);

    expect(screen.getByText(/retrieving integrity record/i)).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Commute Moon Platform" })
    ).toBeInTheDocument();
    expect(screen.getByText("Backblaze B2")).toBeInTheDocument();
    expect(screen.getByText("Verified / 2 steps")).toBeInTheDocument();
    expect(screen.getByText("c".repeat(64))).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /archived dream card/i })
    ).toHaveAttribute("src", "https://signed.example/card.png");
  });

  it("renders a neutral retrieval error without leaking implementation detail", async () => {
    const api: VaultApi = {
      createProof: vi.fn(),
      getProof: vi.fn().mockRejectedValue(new Error("Proof not found."))
    };

    render(<ProofViewer api={api} artifactId={manifest.artifactId} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Proof not found."
    );
  });
});
