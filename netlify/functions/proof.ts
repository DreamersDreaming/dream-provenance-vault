import type { Handler, HandlerResponse } from "@netlify/functions";
import { createB2Store } from "./lib/b2-store";
import { getProof, type ObjectStore } from "./lib/vault-service";

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

export function makeProofHandler(
  storeOrFactory: ObjectStore | (() => ObjectStore)
): Handler {
  return async (event) => {
    if (event.httpMethod !== "GET") {
      return response(405, { error: "Method not allowed." });
    }

    const artifactId = event.queryStringParameters?.id || "";
    try {
      const result = await getProof(resolveStore(storeOrFactory), artifactId);
      return response(200, result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "invalid artifact id") {
          return response(400, { error: "The proof identifier is not valid." });
        }
        if (error.message === "proof not found") {
          return response(404, { error: "Proof not found." });
        }
        if (error.message === "B2 connection is not configured") {
          return response(503, {
            error: "B2 storage is not configured for this deployment."
          });
        }
      }
      return response(500, { error: "The proof could not be retrieved." });
    }
  };
}

export const handler = makeProofHandler(() => createB2Store());
