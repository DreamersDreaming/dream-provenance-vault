# Submission Checklist

Final submission is **NO_GO** until every hard gate below has current evidence.

## Eligibility and rules

- [x] Online participation; no unsupported travel planned
- [x] No entry fee or purchase required by the official rules
- [x] Individual entrant is allowed
- [x] Backblaze B2 is used by the working application
- [x] Genblaze is used for the canonical media lineage
- [ ] Re-open official rules immediately before final submission
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
- [ ] Production proof URL opens in a fresh browser session

## Quality

- [x] Node tests, TypeScript, and production build pass locally
- [x] Genblaze Python tests pass locally
- [x] Re-run full verification after final configuration
- [x] Desktop browser QA
- [x] 390 px mobile QA and no horizontal overflow
- [x] Keyboard and focus QA
- [ ] Production console errors: zero
- [x] Production dependency audit recorded

## Public assets

- [x] Public GitHub repository:
      https://github.com/DreamersDreaming/dream-provenance-vault
- [ ] Public production URL:
- [ ] Public English demo video under 3 minutes on YouTube, Vimeo, or Youku:
- [x] Repository README contains setup and claim boundaries
- [x] Devpost copy names the actual providers and models
- [ ] Video shows the real production B2 write and proof readback
- [ ] No copyrighted music or unlicensed third-party material appears in video

## Devpost

- [x] Entrant account joined the hackathon
- [ ] Required project fields complete
- [ ] Working app URL entered
- [ ] Public repository URL entered
- [ ] Public video URL entered
- [ ] Provider/model fields entered accurately
- [ ] Terms and submission preview checked
- [ ] Final submit pressed
- [ ] Receipt URL or confirmation screenshot saved
- [ ] Working app remains free and accessible through the judging period
- [ ] Master application ledger updated

## Credentials and privacy

- [x] B2 key is bucket-scoped and consumed only by server-side function code
- [x] No secret appears in Git history, app bundle, screenshots, or chat
- [x] No apartment address appears anywhere
- [ ] No local user-profile path appears in the public manifest or bundle
