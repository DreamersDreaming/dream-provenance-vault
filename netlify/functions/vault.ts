import type { Handler, HandlerResponse } from "@netlify/functions";
import { createB2Store } from "./lib/b2-store";
import {
  createProof,
  type CreateProofInput,
  type ObjectStore
} from "./lib/vault-service";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8"
};

function response(
  statusCode: number,
  payload: Record<string, unknown>
): HandlerResponse {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(payload)
  };
}

function resolveStore(
  value: ObjectStore | (() => ObjectStore)
): ObjectStore {
  return typeof value === "function" ? value() : value;
}

export function makeVaultHandler(
  storeOrFactory: ObjectStore | (() => ObjectStore)
): Handler {
  return async (event) => {
    if (event.httpMethod !== "POST") {
      return response(405, { error: "Method not allowed." });
    }

    try {
      const input = JSON.parse(event.body || "") as CreateProofInput;
      const result = await createProof(resolveStore(storeOrFactory), input);
      return response(201, {
        manifest: result.manifest,
        proofPath: `/proof/${result.manifest.artifactId}`
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "B2 connection is not configured"
      ) {
        return response(503, {
          error: "B2 storage is not configured for this deployment."
        });
      }
      return response(400, { error: "The proof request was not valid." });
    }
  };
}

export const handler = makeVaultHandler(() => createB2Store());
