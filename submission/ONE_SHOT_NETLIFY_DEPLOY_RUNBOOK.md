# One-shot Netlify production deployment

This runbook protects the limited Netlify credit allowance. It authorizes one
production deployment only after every pre-deploy gate is complete.

## Isolation

- Netlify team: `ddunis`
- New site only: `doream-provenance-vault`
- Do not connect the site to GitHub CI.
- Do not attach the deploy to an existing Doream, ZeroPlate, ChemiChecks, or
  NiceFarm site.
- Do not create a deploy preview, branch deploy, or draft deploy.

## Hard pre-deploy gates

- [x] Existing Netlify account login complete; no password changed
- [x] Blank isolated Netlify site created without Git integration
- [x] Backblaze account active
- [x] Private B2 bucket created
- [x] Bucket-scoped B2 application key created
- [x] `B2_ENDPOINT`, `B2_REGION`, `B2_BUCKET`, `B2_KEY_ID`, and
      `B2_APPLICATION_KEY` set for production Functions
- [x] No B2 secret appears in Git, the frontend bundle, screenshots, chat, or
      submission documents
- [x] `npm run verify` passes from the final source state
- [x] `npm audit --omit=dev --audit-level=high` reports zero vulnerabilities
- [ ] Final `git status --short` is clean
- [ ] Final commit hash recorded
- [ ] `dist` was built from that exact source state

## Single production command

Run only after every checkbox above is complete:

```powershell
npx netlify deploy --prod --no-build --dir dist --functions netlify/functions --message "Dream Provenance Vault final hackathon deploy"
```

The project must already be linked to the new isolated site. Do not add
`--open`, `--trigger`, or any preview/alias option.

## Post-deploy verification

- [ ] Production home page returns HTTP 200
- [ ] Production page loads with zero console errors
- [ ] Real B2 synthetic upload succeeds
- [ ] Returned proof page opens
- [ ] Private image loads through a short-lived signed URL
- [ ] Readback hashes match the browser, server, Genblaze manifest, and receipt
- [ ] Desktop and 390 px mobile flows pass
- [ ] Production URL recorded in `FINAL_URLS.md`

If a post-deploy check fails, stop and perform root-cause analysis. Do not
redeploy automatically or consume more credits without first identifying the
exact failure and confirming that a redeploy is unavoidable.
