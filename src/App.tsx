import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent
} from "react";
import {
  MAX_CARD_BYTES,
  MAX_GENBLAZE_BYTES,
  sha256Bytes,
  validateGenblazeManifest,
  validateImageBytes,
  type GenblazeManifestSummary,
  type ProofManifest
} from "./domain/proof";
import {
  vaultApi,
  type CreateProofPayload,
  type CreateProofResponse,
  type GetProofResponse
} from "./api";
import { ProofViewer } from "./ProofViewer";

export interface VaultApi {
  createProof(payload: CreateProofPayload): Promise<CreateProofResponse>;
  getProof(artifactId: string): Promise<GetProofResponse>;
}

type WorkState = "idle" | "hashing" | "ready" | "uploading" | "receipt";

interface AppProps {
  api?: VaultApi;
  hashFile?: (file: File) => Promise<string>;
}

const SAMPLE_PATH = "/sample/commute-moon-platform.png";
const SAMPLE_GENBLAZE_PATH = "/sample/genblaze-manifest.json";

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary);
}

async function readBlobBytes(blob: Blob): Promise<Uint8Array> {
  if (typeof blob.arrayBuffer === "function") {
    return new Uint8Array(await blob.arrayBuffer());
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The selected file could not be read."));
    reader.onload = () => {
      if (!(reader.result instanceof ArrayBuffer)) {
        reject(new Error("The selected file could not be read."));
        return;
      }
      resolve(new Uint8Array(reader.result));
    };
    reader.readAsArrayBuffer(blob);
  });
}

async function defaultHashFile(file: File): Promise<string> {
  const bytes = await readBlobBytes(file);
  validateImageBytes(bytes, file.type);
  return sha256Bytes(bytes);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

function shortHash(hash: string): string {
  return `${hash.slice(0, 12)}…${hash.slice(-12)}`;
}

export function App({
  api = vaultApi,
  hashFile = defaultHashFile
}: AppProps) {
  const proofId = useMemo(() => {
    const match = window.location.pathname.match(/^\/proof\/([^/]+)$/);
    return match?.[1] || "";
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(SAMPLE_PATH);
  const [title, setTitle] = useState("Commute Moon Platform");
  const [localHash, setLocalHash] = useState("");
  const [genblazeManifest, setGenblazeManifest] = useState("");
  const [genblazeSummary, setGenblazeSummary] =
    useState<GenblazeManifestSummary | null>(null);
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<WorkState>("idle");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{
    manifest: ProofManifest;
    proofPath: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (proofId) {
    return <ProofViewer api={api} artifactId={proofId} />;
  }

  async function acceptFile(selected: File): Promise<string | null> {
    setError("");
    setReceipt(null);
    setConsent(false);
    setFile(selected);
    setState("hashing");
    setLocalHash("");
    setGenblazeManifest("");
    setGenblazeSummary(null);

    if (selected.size > MAX_CARD_BYTES) {
      setError("Choose a PNG or WebP no larger than 4 MiB.");
      setFile(null);
      setState("idle");
      return null;
    }

    try {
      const hash = await hashFile(selected);
      setLocalHash(hash);
      setState("ready");
      setTitle(
        selected.name
          .replace(/\.(png|webp)$/i, "")
          .replace(/[-_]+/g, " ")
          .slice(0, 60) || "Untitled Dream Card"
      );
      if (typeof URL.createObjectURL === "function") {
        setPreviewUrl(URL.createObjectURL(selected));
      }
      return hash;
    } catch (reason) {
      setFile(null);
      setState("idle");
      setError(
        reason instanceof Error
          ? reason.message
          : "The selected file could not be read."
      );
      return null;
    }
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    const selected = event.target.files?.[0];
    if (selected) {
      await acceptFile(selected);
    }
  }

  async function acceptGenblazeFile(
    selected: File,
    expectedHash = localHash
  ): Promise<void> {
    setError("");
    setReceipt(null);
    setGenblazeManifest("");
    setGenblazeSummary(null);

    if (selected.size > MAX_GENBLAZE_BYTES) {
      setError("Choose a Genblaze JSON manifest no larger than 256 KiB.");
      return;
    }

    if (!expectedHash) {
      setError("Choose and fingerprint the Dream Card first.");
      return;
    }

    try {
      const serialized = new TextDecoder().decode(await readBlobBytes(selected));
      const summary = validateGenblazeManifest(serialized, expectedHash);
      setGenblazeManifest(serialized);
      setGenblazeSummary(summary);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The Genblaze manifest could not be verified."
      );
    }
  }

  async function handleGenblazeChange(
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    const selected = event.target.files?.[0];
    if (selected) {
      await acceptGenblazeFile(selected);
    }
  }

  async function loadSample(): Promise<void> {
    setError("");
    try {
      const [cardResponse, manifestResponse] = await Promise.all([
        fetch(SAMPLE_PATH),
        fetch(SAMPLE_GENBLAZE_PATH)
      ]);
      if (!cardResponse.ok || !manifestResponse.ok) {
        throw new Error("The synthetic sample package could not be loaded.");
      }
      const blob = await cardResponse.blob();
      const sampleHash = await acceptFile(
        new File([blob], "commute-moon-platform.png", {
          type: "image/png"
        })
      );
      if (!sampleHash) return;
      const manifestBlob = await manifestResponse.blob();
      await acceptGenblazeFile(
        new File([manifestBlob], "genblaze-manifest.json", {
          type: "application/json"
        }),
        sampleHash
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The synthetic sample package could not be loaded."
      );
    }
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (
      !file ||
      !consent ||
      !localHash ||
      !genblazeManifest ||
      !genblazeSummary
    ) {
      return;
    }

    setError("");
    setState("uploading");
    try {
      const bytes = await readBlobBytes(file);
      const result = await api.createProof({
        base64: bytesToBase64(bytes),
        contentType: file.type,
        title,
        consentAccepted: true,
        genblazeManifest
      });
      if (result.manifest.file.sha256 !== localHash) {
        throw new Error(
          "The server hash did not match this local file. No receipt was accepted."
        );
      }
      setReceipt(result);
      setState("receipt");
    } catch (reason) {
      setState("ready");
      setError(
        reason instanceof Error
          ? reason.message
          : "The B2 proof could not be created."
      );
    }
  }

  const busy = state === "hashing" || state === "uploading";
  const canSubmit = Boolean(
    file &&
      localHash &&
      genblazeManifest &&
      genblazeSummary &&
      consent &&
      !busy
  );

  return (
    <main>
      <section className="hero">
        <nav className="nav-shell" aria-label="Primary">
          <a className="wordmark" href="#top">
            DOREAM / VAULT
          </a>
          <a href="#workspace">Create proof</a>
        </nav>
        <div className="hero-copy" id="top">
          <p className="eyebrow">Backblaze B2 + Genblaze provenance prototype</p>
          <h1>
            Keep the image.
            <br />
            Prove the bytes.
          </h1>
          <p className="hero-summary">
            A privacy-safe integrity receipt for exported AI Dream Cards.
          </p>
          <a className="text-link" href="#workspace">
            Enter the vault <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className={`hero-artifact ${busy ? "is-scanning" : ""}`}>
          <img src={previewUrl} alt="Synthetic Commute Moon Platform Dream Card" />
          <div className="scan-line" aria-hidden="true" />
          <span className="artifact-caption">Synthetic demo artifact / no user data</span>
        </div>
      </section>

      <section className="workspace" id="workspace">
        <header className="section-heading">
          <p className="eyebrow">Create an integrity record</p>
          <h2>One verified card in. Three private B2 objects out.</h2>
          <p>
            Your browser fingerprints the exact file and checks its Genblaze
            lineage first. The server repeats both checks before storage.
          </p>
        </header>

        <form className="vault-form" onSubmit={handleSubmit}>
          <div className="file-stage">
            <div className={`preview-shell ${busy ? "is-scanning" : ""}`}>
              <img src={previewUrl} alt="Selected Dream Card preview" />
              <div className="scan-line" aria-hidden="true" />
            </div>
            <div className="file-actions">
              <input
                ref={fileInputRef}
                id="dream-card"
                className="visually-hidden"
                type="file"
                accept="image/png,image/webp"
                onChange={handleFileChange}
              />
              <label className="primary-action" htmlFor="dream-card">
                Choose Dream Card
              </label>
              <button className="secondary-action" type="button" onClick={loadSample}>
                Use synthetic sample
              </button>
            </div>
          </div>

          <div className="proof-controls">
            <label className="field-label" htmlFor="card-title">
              Public card label
            </label>
            <input
              id="card-title"
              value={title}
              maxLength={60}
              onChange={(event) => setTitle(event.target.value)}
            />

            <dl className="file-facts" aria-live="polite">
              <div>
                <dt>File</dt>
                <dd>{file?.name || "No file selected"}</dd>
              </div>
              <div>
                <dt>Size</dt>
                <dd>{file ? formatBytes(file.size) : "—"}</dd>
              </div>
              <div>
                <dt>Local SHA-256</dt>
                <dd className="hash-value">
                  {localHash
                    ? localHash
                    : state === "hashing"
                      ? "Calculating exact file fingerprint…"
                      : "Waiting for a card"}
                </dd>
              </div>
            </dl>

            <div className="manifest-stage">
              <input
                id="genblaze-manifest"
                className="visually-hidden"
                type="file"
                accept="application/json,.json"
                onChange={handleGenblazeChange}
                disabled={!localHash || busy}
              />
              <label className="secondary-action" htmlFor="genblaze-manifest">
                Choose Genblaze manifest
              </label>
              <dl className="file-facts" aria-live="polite">
                <div>
                  <dt>Genblaze</dt>
                  <dd>
                    {genblazeSummary
                      ? `Verified / ${genblazeSummary.stepCount} steps`
                      : "Waiting for a verified manifest"}
                  </dd>
                </div>
                <div>
                  <dt>Canonical hash</dt>
                  <dd className="hash-value">
                    {genblazeSummary?.canonicalHash || "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="disclosure">
              <p className="disclosure-title">Stored in private B2</p>
              <p>
                Card image, app receipt, and privacy-redacted Genblaze
                canonical manifest.
              </p>
              <p className="disclosure-title">Never requested</p>
              <p>Dream text, interpretation, prompt, email, name, address.</p>
            </div>

            <label className="consent-line">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
              />
              <span>
                I understand this card, app receipt, and privacy-redacted
                Genblaze manifest will be stored in a private Backblaze B2
                bucket.
              </span>
            </label>

            <button className="submit-action" type="submit" disabled={!canSubmit}>
              {state === "uploading"
                ? "Writing three B2 objects…"
                : "Create B2 proof"}
            </button>

            {error ? (
              <p className="error-message" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </form>
      </section>

      {receipt ? (
        <section className="receipt-section receipt-rise" aria-live="polite">
          <p className="eyebrow">Storage confirmed</p>
          <h2>B2 proof created.</h2>
          <div className="receipt-grid">
            <dl className="receipt-list">
              <div>
                <dt>Provider</dt>
                <dd>{receipt.manifest.storage.provider}</dd>
              </div>
              <div>
                <dt>SHA-256</dt>
                <dd
                  className="hash-value"
                  title={receipt.manifest.file.sha256}
                >
                  {receipt.manifest.file.sha256}
                </dd>
              </div>
              <div>
                <dt>Recorded</dt>
                <dd>
                  {new Date(
                    receipt.manifest.provenance.createdAt
                  ).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt>Genblaze</dt>
                <dd>
                  Verified / {receipt.manifest.genblaze.stepCount} steps
                </dd>
              </div>
            </dl>
            <div className="receipt-action">
              <span className="hash-short">
                {shortHash(receipt.manifest.file.sha256)}
              </span>
              <a className="primary-action" href={receipt.proofPath}>
                Open proof receipt
              </a>
            </div>
          </div>
        </section>
      ) : null}

      <section className="boundary-section">
        <p className="eyebrow">A deliberately narrow claim</p>
        <h2>Integrity, not ownership theater.</h2>
        <p>
          The receipt proves which bytes were stored and when they were
          recorded. It does not register copyright, decide authorship, mint an
          NFT, diagnose a person, or create an investment product.
        </p>
      </section>

      <footer>
        <span>Dream Provenance Vault / Hackathon prototype</span>
        <a href="https://doream.org">Visit Doream</a>
      </footer>
    </main>
  );
}
