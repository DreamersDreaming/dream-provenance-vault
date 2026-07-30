import type { ProofManifest } from "./domain/proof";

export interface CreateProofPayload {
  base64: string;
  contentType: string;
  title: string;
  consentAccepted: boolean;
  genblazeManifest: string;
}

export interface CreateProofResponse {
  manifest: ProofManifest;
  proofPath: string;
}

export interface GetProofResponse {
  manifest: ProofManifest;
  imageUrl: string;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(body.error || "The vault request failed.");
  }
  return body;
}

export const vaultApi = {
  async createProof(payload: CreateProofPayload): Promise<CreateProofResponse> {
    const response = await fetch("/.netlify/functions/vault", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    return parseResponse<CreateProofResponse>(response);
  },

  async getProof(artifactId: string): Promise<GetProofResponse> {
    const response = await fetch(
      `/.netlify/functions/proof?id=${encodeURIComponent(artifactId)}`
    );
    return parseResponse<GetProofResponse>(response);
  }
};
