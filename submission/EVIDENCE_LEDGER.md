# Evidence Ledger

This file separates verified implementation evidence from external submission
claims. Update it immediately before final Devpost submission.

## Local implementation — verified 2026-07-31 KST

| Gate | Evidence | Status |
|---|---|---|
| Node tests | 7 files, 30 tests | PASS |
| TypeScript | `tsc --noEmit` | PASS |
| Production build | Vite 6.4.3 | PASS |
| Genblaze tests | 2 Python tests | PASS |
| Genblaze manifest | `genblaze-core==0.3.8`, verified `true`, 2 steps | PASS |
| Production dependency audit | `npm audit --omit=dev --audit-level=high` | 0 vulnerabilities |
| GitHub Actions | `verify` run `30536334429` on commit `2f542186071b8f053057092c6c6f5ee7ab57904a` | PASS |
| Desktop visual QA | 1440 × 1000 actual browser | PASS |
| Mobile layout QA | 390 × 844; `scrollWidth === innerWidth` | PASS |
| Public GitHub repository | `DreamersDreaming/dream-provenance-vault` | PASS |
| Devpost participation | Registration confirmation shown for challenge `30205` | PASS |
| Real B2 write/readback | Scoped-key S3 `PutObject` → `GetObject` body match → `DeleteObject`, HTTP 200, 2026-07-31 KST | PASS |
| Public production URL | Isolated Netlify site `doream-provenance-vault` created without Git integration; five B2 production variables verified by redacted API metadata; deployment deliberately withheld until final local verification | READY, NOT DEPLOYED |
| Devpost receipt | Required video and production URL pending | NOT SUBMITTED |

## Current source state

- Standalone repository, isolated from the live Doream worktree
- Branch: `codex/backblaze-provenance-vault`
- Latest locally verified commit before external configuration:
  recorded by `git rev-parse HEAD` after each verified commit

## Claim boundary

Local PASS does not mean the hackathon submission is complete. Final GO
requires a judge-accessible GitHub repository, real private B2
upload/readback, public production URL, public sub-three-minute video, and a
Devpost receipt.

## Official submission constraints — verified 2026-07-30 KST

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
- Netlify environment: the Free plan does not permit secret variables with
  restricted scopes. Credentials are therefore stored as production
  site-level variables, with no Git integration or automated builds, and are
  consumed only by the server-side Netlify Function code.
- Netlify deployment: deliberately withheld until the final local verification
  pass is complete; no normal Chrome window or duplicate service tab will be
  opened

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
