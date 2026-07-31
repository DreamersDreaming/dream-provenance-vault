# Submission Checklist

Final submission is **GO — SUBMITTED 2026-07-31 11:21 KST**. Judge-access
availability remains an ongoing obligation through the judging period.

## Eligibility and rules

- [x] Online participation; no unsupported travel planned
- [x] No entry fee or purchase required by the official rules
- [x] Individual entrant is allowed
- [x] Backblaze B2 is used by the working application
- [x] Genblaze is used for the canonical media lineage
- [x] Re-open official rules immediately before final submission
- [x] Official deadline confirmed: 2026-08-03 17:00 EDT
      (2026-08-04 06:00 KST)
- [x] Judging access period confirmed: through 2026-08-11 17:00 EDT
      (2026-08-12 06:00 KST)

## Product

- [x] Card PNG/WebP signature and 4 MiB size checks
- [x] Browser-side SHA-256
- [x] Server-side SHA-256
- [x] Final Genblaze asset hash must equal the server hash
- [x] Source prompt must be redacted
- [x] Local filesystem paths are rejected
- [x] Private bucket design and short-lived signed image URL
- [x] Three-object receipt commit order
- [x] Public write/read rate limits configured
- [x] Real B2 synthetic upload succeeded
- [x] Real B2 private readback succeeded
- [x] Production proof URL opens in the authenticated Temp Chrome session and
      through an independent public HTTP client

## Quality

- [x] Node tests, TypeScript, and production build pass locally
- [x] Genblaze Python tests pass locally
- [x] Re-run full verification after final configuration
- [x] Desktop browser QA
- [x] 390 px mobile QA and no horizontal overflow
- [x] Keyboard and focus QA
- [x] Production console errors: zero
- [x] Production dependency audit recorded

## Public assets

- [x] Public GitHub repository:
      https://github.com/DreamersDreaming/dream-provenance-vault
- [x] Public production URL:
      https://doream-provenance-vault.netlify.app
- [x] Public English demo video under 3 minutes on YouTube:
      https://youtu.be/fW3C3nxwI1E
- [x] Repository README contains setup and claim boundaries
- [x] Devpost copy names the actual providers and models
- [x] Local final video shows the real production B2 write and proof readback
- [x] No copyrighted music or unlicensed third-party material appears in video

## Devpost

- [x] Entrant account joined the hackathon
- [x] Required project fields complete
- [x] Working app URL entered
- [x] Public repository URL entered
- [x] Public video URL entered
- [x] Provider/model fields entered accurately
- [x] Terms and submission preview checked
- [x] Final submit pressed
- [x] Receipt URL or confirmation screenshot saved
- [x] Working app is currently free and accessible; retain through the judging
      period
- [x] Master application ledger updated

## Credentials and privacy

- [x] B2 key is bucket-scoped and consumed only by server-side function code
- [x] No secret appears in Git history, app bundle, screenshots, or chat
- [x] No apartment address appears anywhere
- [x] No local user-profile path appears in the public manifest or bundle
