# Final Demo Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Record and validate a silent, English-captioned, sub-three-minute
video of the live Dream Provenance Vault production workflow.

**Architecture:** Use a temporary headless Playwright browser context with
1280 × 720 video recording. Drive only the public production site, add a
fixed caption layer in the page DOM, create one synthetic B2 proof, open its
public receipt, then close the context so Playwright finalizes the WebM file.
No authenticated browser session, local development server, or Netlify deploy
is involved.

**Tech Stack:** Playwright, Chromium WebM recording, deployed React app,
Backblaze B2, Genblaze manifest.

---

### Task 1: Record the live production workflow

**Files:**

- Preserve: `C:/Users/Tyler/Downloads/Dream_Provenance_Vault_Demo_Draft_v1.webm`
- Create:
  `C:/Users/Tyler/Downloads/Dream_Provenance_Vault_Demo_Final_20260731.webm`

- [ ] **Step 1: Launch an isolated headless recording context**

Use the installed Playwright runtime to launch headless Chromium, create a
1280 × 720 context with `recordVideo`, and open:

```text
https://doream-provenance-vault.netlify.app
```

Expected: the page title is `Dream Provenance Vault` and the response is 200.

- [ ] **Step 2: Add the caption layer**

Insert one fixed bottom caption box with:

```css
position: fixed;
left: 6%;
right: 6%;
bottom: 26px;
z-index: 2147483647;
background: rgba(4, 8, 17, 0.92);
border: 1px solid rgba(250, 204, 21, 0.7);
color: #f8fafc;
font: 600 24px/1.35 Arial, sans-serif;
padding: 16px 22px;
text-align: center;
```

The layer must never contain account data, local paths, or unverified claims.

- [ ] **Step 3: Record the problem and product**

Show the hero and workspace with these captions:

```text
Generative images are easy to copy, but their production evidence is easy to lose.
Dream Provenance Vault preserves byte integrity without storing the private dream story.
```

Expected: each caption remains visible for at least five seconds.

- [ ] **Step 4: Record the verified input**

Click `Use synthetic sample`, wait for:

```text
Genblaze
Verified / 2 steps
```

Then show:

```text
The browser hashes the exact card and verifies its privacy-redacted Genblaze lineage before upload.
```

Expected: the file name, local SHA-256, canonical hash, and verified step count
are visible.

- [ ] **Step 5: Record the real B2 write**

Check the consent box and click `Create B2 proof`. Wait for:

```text
B2 proof created.
```

Show:

```text
The server repeats the checks and commits the card, Genblaze manifest, and receipt as three private B2 objects.
```

Expected: the receipt shows Backblaze B2, SHA-256, timestamp, and
`Verified / 2 steps`.

- [ ] **Step 6: Record the proof readback**

Click `Open proof receipt`, wait for `B2 RECORD FOUND`, and show:

```text
The proof page reads the private manifest and returns the card through a short-lived signed B2 URL.
SHA-256, Backblaze B2, Genblaze verification, and the artifact ID make the integrity evidence independently inspectable.
```

Expected: the receipt page visibly contains the SHA-256, `Backblaze B2`,
`Verified / 2 steps`, canonical hash, and artifact ID.

- [ ] **Step 7: Record the narrow claim and links**

Show:

```text
This proves storage provenance and byte integrity — not copyright ownership.
Live: doream-provenance-vault.netlify.app
Code: github.com/DreamersDreaming/dream-provenance-vault
```

Expected: the claim boundary and both public destinations remain visible for
at least eight seconds.

- [ ] **Step 8: Finalize without touching the draft**

Close the recording page, context, and browser. Rename only the newly
finalized recording to:

```text
C:/Users/Tyler/Downloads/Dream_Provenance_Vault_Demo_Final_20260731.webm
```

Expected: the draft file still exists with its original size and timestamp.

### Task 2: Verify the final video

**Files:**

- Inspect:
  `C:/Users/Tyler/Downloads/Dream_Provenance_Vault_Demo_Final_20260731.webm`
- Update: `submission/FINAL_URLS.md`
- Update: `submission/SUBMISSION_CHECKLIST.md`
- Update: `submission/EVIDENCE_LEDGER.md`

- [ ] **Step 1: Check media metadata in Chromium**

Open the local WebM in the existing Netlify service tab temporarily and read
the HTML video metadata.

Expected:

```text
duration < 180 seconds
videoWidth = 1280
videoHeight = 720
```

- [ ] **Step 2: Inspect representative frames**

Capture frames near the beginning, live write, proof readback, and closing
screen.

Expected: no `DRAFT` badge, no secret, no apartment address, no local path,
and readable English captions.

- [ ] **Step 3: Confirm the recorded proof**

Read the proof URL shown during recording and verify home, proof API, and
signed image HTTP statuses are 200.

Expected: server manifest and signed image hashes match.

- [ ] **Step 4: Preserve claim boundaries**

Search the new documentation and captions for ownership, copyright,
registration, revenue, or legal-guarantee claims.

Expected: only the explicit narrow claim remains.

- [ ] **Step 5: Update evidence without overclaiming**

Record local final-video validation, but leave the public video URL and
Devpost final receipt blank until actual upload and final submission receipts
exist.

- [ ] **Step 6: Commit**

```powershell
git add -- docs/superpowers/plans/2026-07-31-final-demo-video.md `
  submission/EVIDENCE_LEDGER.md submission/SUBMISSION_CHECKLIST.md
git commit -m "Validate final live demo video"
git push origin main
```

Expected: the public repository contains the evidence updates and no video
binary or credential.
