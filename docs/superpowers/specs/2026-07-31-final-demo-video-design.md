# Final Demo Video Design

## Goal

Produce a public, English-readable, sub-three-minute Devpost demo that proves
the deployed application performs a real Backblaze B2 write and proof
readback. Preserve the existing draft unchanged.

## Options considered

1. Reuse the 2:10 draft: rejected because the embedded
   `DRAFT · LIVE B2 SEGMENT PENDING` badge contradicts the live evidence.
2. Record a narrated replacement: rejected because narration adds language,
   microphone, and retake dependencies without improving judge verification.
3. Record a silent live replacement with on-screen English captions:
   selected because it is self-contained, accessible, and evidence-first.

## Storyboard

Target duration: 90–110 seconds at 1280 × 720.

1. Problem and value, 10 seconds:
   generative images are easy to copy while production evidence is easy to
   lose.
2. Live production input, 35 seconds:
   open the deployed app, choose the synthetic Dream Card and verified
   Genblaze manifest, and confirm privacy consent.
3. Real storage, 20 seconds:
   create the proof and show the successful private B2 record.
4. Verification, 30 seconds:
   open the proof URL and highlight SHA-256, Backblaze B2, Genblaze verified
   status, two lineage steps, and the artifact ID.
5. Closing links, 10 seconds:
   show the production URL and public GitHub repository.

## Evidence and privacy boundaries

- Record the public production site, not localhost.
- Use only the synthetic sample card and its redacted Genblaze manifest.
- Never display account settings, keys, tokens, email inboxes, local paths, or
  private dream text.
- Do not claim copyright registration, ownership determination, revenue, or a
  legal guarantee.
- The proof demonstrates byte integrity and storage provenance only.

## Acceptance criteria

- Duration is below three minutes.
- No `DRAFT` or pending-live badge appears.
- English captions remain readable at 720p.
- The video shows a successful live proof creation and the resulting proof
  page.
- The shown proof records Backblaze B2, Genblaze verified status, two steps,
  SHA-256, and an artifact ID.
- No secret, apartment address, or local user-profile path appears.
- The output is retained locally before any public upload.
