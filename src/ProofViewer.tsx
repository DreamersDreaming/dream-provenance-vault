import { useEffect, useState } from "react";
import type { GetProofResponse } from "./api";
import type { VaultApi } from "./App";

export function ProofViewer({
  api,
  artifactId
}: {
  api: VaultApi;
  artifactId: string;
}) {
  const [proof, setProof] = useState<GetProofResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .getProof(artifactId)
      .then((result) => active && setProof(result))
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "The proof could not be retrieved."
          );
        }
      });
    return () => {
      active = false;
    };
  }, [api, artifactId]);

  if (error) {
    return (
      <main className="proof-page">
        <a className="wordmark" href="/">
          DOREAM / VAULT
        </a>
        <p className="eyebrow">Receipt unavailable</p>
        <h1>We could not open this proof.</h1>
        <p role="alert" className="error-message">
          {error}
        </p>
      </main>
    );
  }

  if (!proof) {
    return (
      <main className="proof-page" aria-busy="true">
        <a className="wordmark" href="/">
          DOREAM / VAULT
        </a>
        <p className="eyebrow">Reading private B2 archive</p>
        <h1>Retrieving integrity record…</h1>
      </main>
    );
  }

  const { manifest, imageUrl } = proof;
  return (
    <main className="proof-page receipt-rise">
      <header className="proof-header">
        <a className="wordmark" href="/">
          DOREAM / VAULT
        </a>
        <span className="verified-mark">B2 record found</span>
      </header>
      <div className="proof-layout">
        <img
          className="proof-image"
          src={imageUrl}
          alt={`${manifest.title} archived Dream Card`}
        />
        <section className="proof-copy">
          <p className="eyebrow">File integrity receipt</p>
          <h1>{manifest.title}</h1>
          <dl className="receipt-list">
            <div>
              <dt>SHA-256</dt>
              <dd className="hash-value">{manifest.file.sha256}</dd>
            </div>
            <div>
              <dt>Recorded</dt>
              <dd>{new Date(manifest.provenance.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt>Storage</dt>
              <dd>{manifest.storage.provider}</dd>
            </div>
            <div>
              <dt>Genblaze</dt>
              <dd>Verified / {manifest.genblaze.stepCount} steps</dd>
            </div>
            <div>
              <dt>Genblaze canonical hash</dt>
              <dd className="hash-value">
                {manifest.genblaze.canonicalHash}
              </dd>
            </div>
            <div>
              <dt>Artifact ID</dt>
              <dd>{manifest.artifactId}</dd>
            </div>
          </dl>
          <p className="legal-boundary">
            This receipt records file integrity and storage provenance. It is
            not copyright registration or a legal ownership determination.
          </p>
        </section>
      </div>
    </main>
  );
}
