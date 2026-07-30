# Submission Checklist

Final submission is **NO_GO** until every hard gate below has current evidence.

## Eligibility and rules

- [x] Online participation; no unsupported travel planned
- [x] No entry fee or purchase required by the official rules
- [x] Individual entrant is allowed
- [x] Backblaze B2 is used by the working application
- [x] Genblaze is used for the canonical media lineage
- [ ] Re-open official rules immediately before final submission
- [ ] Confirm final deadline and timezone on Devpost

## Product

- [x] Card PNG/WebP signature and 5 MiB size checks
- [x] Browser-side SHA-256
- [x] Server-side SHA-256
- [x] Final Genblaze asset hash must equal the server hash
- [x] Source prompt must be redacted
- [x] Local filesystem paths are rejected
- [x] Private bucket design and short-lived signed image URL
- [x] Three-object receipt commit order
- [ ] Real B2 synthetic upload succeeded
- [ ] Real B2 private readback succeeded
- [ ] Production proof URL opens in a fresh browser session

## Quality

- [x] Node tests, TypeScript, and production build pass locally
- [x] Genblaze Python tests pass locally
- [ ] Re-run full verification after final configuration
- [ ] Desktop browser QA
- [ ] 390 px mobile QA and no horizontal overflow
- [ ] Keyboard and focus QA
- [ ] Production console errors: zero
- [ ] Production dependency audit recorded

## Public assets

- [ ] Public GitHub repository:
- [ ] Public production URL:
- [ ] Public English demo video under 3 minutes:
- [ ] Repository README contains setup and claim boundaries
- [ ] Devpost copy names the actual providers and models
- [ ] Video shows the real production B2 write and proof readback

## Devpost

- [ ] Entrant account joined the hackathon
- [ ] Required project fields complete
- [ ] Working app URL entered
- [ ] Public repository URL entered
- [ ] Public video URL entered
- [ ] Provider/model fields entered accurately
- [ ] Terms and submission preview checked
- [ ] Final submit pressed
- [ ] Receipt URL or confirmation screenshot saved
- [ ] Master application ledger updated

## Credentials and privacy

- [ ] B2 key is bucket-scoped and server-side only
- [ ] No secret appears in Git history, app bundle, screenshots, or chat
- [ ] No apartment address appears anywhere
- [ ] No local user-profile path appears in the public manifest or bundle

