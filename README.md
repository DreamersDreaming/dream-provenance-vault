# Dream Provenance Vault

A privacy-safe provenance prototype for exported AI Dream Cards, built with
[Genblaze](https://github.com/backblaze-labs/genblaze) and private
[Backblaze B2](https://www.backblaze.com/cloud-storage).

Creative media is easy to copy and hard to inspect. Dream Provenance Vault
binds a finished card to a verified two-step Genblaze lineage and stores the
evidence as three private B2 objects:

1. the exact Dream Card bytes;
2. the privacy-redacted Genblaze canonical manifest; and
3. a compact application receipt containing the server-calculated SHA-256.

The browser checks the image and lineage first. The server independently
re-hashes the image, confirms that the final Genblaze asset has the same
SHA-256, and only then writes the evidence bundle.

## Demo flow

```text
synthetic source image
        |
        v
Genblaze step 1: doream-image-generation
        |
        v
Genblaze step 2: doream-prism-card-renderer
        |
        v
browser SHA-256 + server SHA-256 + final-asset match
        |
        v
private B2: card.png + genblaze-manifest.json + manifest.json
        |
        v
random proof URL + 15-minute signed image URL
```

The bundled sample is synthetic and contains no user dream text. Its Genblaze
manifest is generated with `genblaze-core==0.3.8`, verifies successfully, and
uses portable provenance URLs rather than local filesystem paths.

## Privacy and claim boundaries

The application does not request dream text, interpretation text, a private
prompt, email, name, address, payment data, or account identifiers. The source
generation prompt in the accepted Genblaze manifest must be exactly
`[private prompt redacted]`, and manifests containing local file paths are
rejected.

This is an integrity and storage-provenance record. It is not:

- copyright registration or an ownership determination;
- an NFT or investment product;
- a medical, diagnostic, or treatment service; or
- proof that the creative process occurred at a particular legal time.

## Stack

- React 18, TypeScript, Vite
- Netlify Functions
- Backblaze B2 through its S3-compatible API
- Genblaze Core for canonical generative-media provenance
- Vitest and Testing Library

## Local setup

```bash
npm install
python -m venv .venv
python -m pip install -r genblaze/requirements.txt
python genblaze/build_manifest.py
npm run verify
npx netlify dev
```

On Windows, activate the local environment or run:

```powershell
.\.venv\Scripts\python.exe -m pip install -r genblaze\requirements.txt
.\.venv\Scripts\python.exe genblaze\build_manifest.py
```

## Backblaze B2 configuration

Create a private bucket and a bucket-scoped application key with only the
read/write permissions required by this prototype. Configure these as
server-side Netlify environment variables:

```dotenv
B2_ENDPOINT=https://s3.<region>.backblazeb2.com
B2_REGION=<region>
B2_BUCKET=<private-bucket-name>
B2_KEY_ID=<bucket-scoped-key-id>
B2_APPLICATION_KEY=<bucket-scoped-application-key>
```

Never expose these values through Vite variables, browser code, screenshots,
logs, or commits.

## Verification

```bash
npm run verify
python -m pytest genblaze/test_build_manifest.py -q
python genblaze/build_manifest.py
```

The Node verification gate runs the full test suite, TypeScript checking, and a
production Vite build. The Python gate builds and verifies the real two-step
Genblaze manifest.

## Project status

The implementation is locally verified. A production claim is made only after:

- a real private B2 upload and readback pass;
- a public production URL is checked in a real browser;
- the repository is public;
- the demo video is public and shorter than three minutes; and
- Devpost provides final submission receipt evidence.

