# Evidence Ledger

This file separates verified implementation evidence from external submission
claims. Update it immediately before final Devpost submission.

## Local implementation — verified 2026-07-30 KST

| Gate | Evidence | Status |
|---|---|---|
| Node tests | 7 files, 30 tests | PASS |
| TypeScript | `tsc --noEmit` | PASS |
| Production build | Vite 6.4.3 | PASS |
| Genblaze tests | 2 Python tests | PASS |
| Genblaze manifest | `genblaze-core==0.3.8`, verified `true`, 2 steps | PASS |
| Production dependency audit | `npm audit --omit=dev --audit-level=high` | 0 vulnerabilities |
| GitHub Actions | `verify` run `30535136272` on commit `71385af` | PASS |
| Desktop visual QA | 1440 × 1000 actual browser | PASS |
| Mobile layout QA | 390 × 844; `scrollWidth === innerWidth` | PASS |
| Public GitHub repository | `DreamersDreaming/dream-provenance-vault` | PASS |
| Real B2 write/readback | No production credentials yet | NOT RUN |
| Public production URL | Netlify authentication pending | NOT RUN |
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

## External blockers

- Backblaze account creation: CAPTCHA required; no credit card requested
- Netlify CLI authentication: not started until the Backblaze browser approval
  is completed, to avoid duplicate pop-ups
