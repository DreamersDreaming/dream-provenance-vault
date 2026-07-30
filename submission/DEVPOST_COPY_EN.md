# Devpost Submission Copy

## Project name

Dream Provenance Vault

## Tagline

Privacy-safe Genblaze lineage and Backblaze B2 integrity receipts for AI Dream
Cards.

## Inspiration

Generative media can be copied in seconds, while the evidence needed to inspect
its lineage is often scattered across tools or lost entirely. Doream creates
visual Dream Cards, but private dream narratives should not be placed into a
public proof system. We wanted a narrow, useful answer: preserve verifiable
media lineage and exact file integrity without collecting the private story
behind the image.

## What it does

Dream Provenance Vault accepts an exported PNG or WebP Dream Card together with
a privacy-redacted Genblaze canonical manifest. In the browser it calculates
the card's SHA-256 and checks that the final Genblaze asset points to those same
bytes. The server repeats both checks and, only after they pass, writes three
objects to a private Backblaze B2 bucket:

- the exact card image;
- the Genblaze canonical manifest; and
- an application receipt with a random artifact ID, byte count, MIME type,
  server-calculated SHA-256, timestamp, and B2 object keys.

The returned proof page reads the private receipt and displays the card through
a short-lived signed B2 URL.

## How we built it

The client is React, TypeScript, and Vite. Netlify Functions perform
server-side validation and connect to Backblaze B2 through its S3-compatible
API. We use `genblaze-core==0.3.8` to create and verify a two-step generative
media run:

1. provider `doream`, model `doream-image-generation`;
2. provider `doream`, model `doream-prism-card-renderer`.

The bundled submission sample uses synthetic media. Its source prompt is
redacted, its final card hash is bound to the last Genblaze asset, and local
filesystem paths are excluded. B2 credentials stay server-side. The bucket is
private, artifact IDs are random UUIDs, and image access expires after 15
minutes.

This hackathon extension was built during the submission period. It adds the
Genblaze lineage workflow, the private B2 evidence bundle, independent
client/server hash verification, and the receipt retrieval experience to the
existing Doream concept.

## How Backblaze B2 and Genblaze are essential

Genblaze provides the canonical multi-step media lineage and asset hashes.
Backblaze B2 preserves both the generated artifact and its provenance evidence
as a private evidence bundle. Either layer alone is incomplete: Genblaze
explains the media pipeline, while B2 durably stores the exact bytes and the
verifiable records together.

## Challenges

The main challenge was privacy. A provenance manifest can accidentally include
raw prompts or local file paths. We added explicit rejection rules for
unredacted source prompts and local paths, then required both browser-side and
server-side hash agreement before any receipt is issued.

We also kept the claim deliberately narrow. The receipt verifies stored bytes
and recorded provenance; it does not decide copyright ownership or authorship.

## Accomplishments

- A real, verified two-step Genblaze canonical manifest
- Three-object private B2 evidence bundles
- Independent browser and server SHA-256 verification
- Final Genblaze asset-to-card hash binding
- Short-lived signed image retrieval
- Privacy tests that reject raw prompts, local paths, invalid signatures, and
  mismatched lineage
- Responsive desktop and mobile receipt experience

## What we learned

Provenance is most credible when the application makes small, testable claims.
Separating creative privacy from artifact integrity produced a clearer product
and a safer technical boundary.

## What's next

Next we would integrate manifest creation directly into Doream's export
pipeline, add optional signature verification and lifecycle rules, and support
user-controlled deletion and export of the entire evidence bundle.

## Built with

Backblaze B2, Genblaze Core, React, TypeScript, Vite, Netlify Functions, AWS SDK,
Vitest

## Submission links

- Working app: https://doream-provenance-vault.netlify.app
- Public GitHub repository:
  https://github.com/DreamersDreaming/dream-provenance-vault
- Public demo video: https://youtu.be/fW3C3nxwI1E
