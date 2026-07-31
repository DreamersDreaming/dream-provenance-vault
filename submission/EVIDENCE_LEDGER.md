# Evidence Ledger

This file separates verified implementation evidence from external submission
claims. It was updated immediately after the final Devpost submission.

## Local implementation — verified 2026-07-31 KST

| Gate | Evidence | Status |
|---|---|---|
| Node tests | 7 files, 30 tests | PASS |
| TypeScript | `tsc --noEmit` | PASS |
| Production build | Vite 6.4.3 | PASS |
| Genblaze tests | 2 Python tests | PASS |
| Genblaze manifest | `genblaze-core==0.3.8`, verified `true`, 2 steps | PASS |
| Production dependency audit | `npm audit --omit=dev --audit-level=high` | 0 vulnerabilities |
| GitHub Actions | `verify` run `30571905755` on deployed commit `f9cc48f36008535e65e5242ec5abb6358980fd7b` | PASS |
| Desktop visual QA | 1440 × 1000 actual browser | PASS |
| Mobile layout QA | 390 × 844; `scrollWidth === innerWidth` | PASS |
| Public GitHub repository | `DreamersDreaming/dream-provenance-vault` | PASS |
| Devpost participation | Registration confirmation shown for challenge `30205` | PASS |
| Real B2 write/readback | Scoped-key S3 `PutObject` → `GetObject` body match → `DeleteObject`, HTTP 200, 2026-07-31 KST | PASS |
| Public production URL | `https://doream-provenance-vault.netlify.app`; home 200, production function write 201, proof API 200, signed B2 image 200 | PASS |
| Production E2E integrity | Browser input, server manifest, proof readback, and signed B2 image SHA-256 and byte length all match; Genblaze `verified: true`, 2 steps | PASS |
| Production browser QA | Desktop 1440 × 1000 and mobile 390 × 844; home/proof 200, no horizontal overflow, zero console/page errors | PASS |
| Final demo video | `https://youtu.be/fW3C3nxwI1E`; unlisted/link-accessible YouTube video, independently accessible without the authenticated session; local source is 74.73 seconds, 1280 × 720, 30 fps, VP9, 3.37 MB | PASS — PUBLIC BY LINK |
| Final video content QA | Frames at 2, 22, 48, and 69 seconds show live product value, verified input, B2 receipt, and the narrow claim/public links; no draft badge or private data | PASS |
| Video proof readback | Recorded artifact `213fadb4-117a-4014-91e7-142cf3e93c07`; home/proof 200, B2 signed image readback hash matches, Genblaze verified with 2 steps | PASS |
| Devpost final submission | Project `1119478`; final banner states `Project submitted!`; manage-submissions page shows `SUBMITTED`; receipt and two hashed screenshots saved | PASS — SUBMITTED 2026-07-31 11:21 KST |

## Current source state

- Standalone repository, isolated from the live Doream worktree
- Branch: `main`
- Deployed source commit:
  `f9cc48f36008535e65e5242ec5abb6358980fd7b`
- Netlify production deploy:
  `6a6b9c22a714cd4e376725dc`
- Verified production artifact:
  `2c881441-60c5-447a-a57a-4fb7252c07d0`

## Claim boundary

The external hackathon submission is complete. The judge-accessible GitHub
repository, private B2 upload/readback, production URL, sub-three-minute video,
and Devpost receipt were all verified. This does not imply selection or an
award.

## Official submission constraints — re-verified 2026-07-31 KST

- Submission deadline: 2026-08-03 17:00 EDT
  (2026-08-04 06:00 KST)
- Judging period ends: 2026-08-11 17:00 EDT
  (2026-08-12 06:00 KST)
- Individual entrants are eligible and no purchase or payment is required.
- The working app must use both Backblaze B2 and Genblaze.
- A public or private GitHub repository is accepted; a private repository must
  grant access to the `b2genblaze` GitHub account.
- The public demo video must be shorter than three minutes and hosted on
  YouTube, Vimeo, or Youku.
- Submission materials and testing instructions must be in English or include
  an English translation.
- The working app must remain free and available through the judging period.

## External configuration

- Backblaze account: active for `ceo@doream.org` in `US West`; no credit card
  requested
- Private bucket: `doream-provenance-vault-20260731`, region `us-west-004`,
  default SSE-B2 encryption enabled, Object Lock disabled
- Application key: restricted to the private bucket and `artifacts/` prefix,
  read/write, 60-day lifetime; the credential value is not stored in Git,
  documents, screenshots, or the frontend bundle
- Netlify authentication: existing account login verified in the authenticated
  Temp Chrome session; no password was changed
- Temporary Netlify personal access token: created only for the isolated
  deployment, revoked after verification, and cleared from the automation
  process memory
- Netlify environment: the Free plan does not permit secret variables with
  restricted scopes. Credentials are therefore stored as production
  site-level variables, with no Git integration or automated builds, and are
  consumed only by the server-side Netlify Function code.
- Netlify deployment: published from the isolated site with no Git integration.
  The first upload attempt created an unpublished `error` deploy because root
  test filenames were parsed as function names. A regression test was added,
  the tests were moved outside the function root, local function packaging
  produced only `proof.zip` and `vault.zip`, and the corrected production
  deploy passed.

## Netlify deployment budget

- Team: `ddunis`, Free plan
- Billing cycle: 2026-07-22 through 2026-08-21
- Allowance: 300 credits
- Current UI evidence on 2026-07-31: 102.7 of 300 credits remain; 13 production
  deploys consumed 195 credits in the current billing cycle
- Deployment policy: no preview deploys and no iterative production deploys;
  complete B2 configuration and local verification first, then publish the
  exact verified commit once
- Isolation policy: create a separate hackathon site; do not attach, replace,
  or reconfigure any existing Doream/ZeroPlate/ChemiChecks site
