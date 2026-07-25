# MHE Toolkit

LogistiQ field reference calculators for conveyor system design.

## Deploying to GitHub Pages — no terminal needed

This project includes a GitHub Actions workflow that automatically builds and
deploys the app every time you upload files. You just need a web browser.

1. **Create a new repo** at github.com → click the **+** in the top right →
   "New repository." Name it `mhe-toolkit`. Leave it public. Don't
   initialize with a README (this zip already has one).

   > If you pick a different name, open `vite.config.js` and change `base`
   > to match (e.g. `/your-repo-name/`), and do the same in
   > `public/manifest.json` for `start_url` and `scope`.

2. **Upload the files.** On your new repo's page, click "uploading an
   existing file" (or drag files onto the page). Drag in *everything* from
   the unzipped `mhe-toolkit` folder — including the hidden `.github` and
   `.gitignore` — keeping the folder structure intact. Commit the upload.

   > Tip: if your browser hides the `.github` folder when you unzip, you can
   > zip and drag the whole unzipped `mhe-toolkit` folder's contents at once
   > rather than picking files one by one — GitHub's upload page accepts
   > folder drag-and-drop.

3. **Turn on Pages with Actions as the source:** go to your repo → Settings →
   Pages → under "Build and deployment," set **Source** to
   **"GitHub Actions."**

4. **Watch it build:** go to the "Actions" tab in your repo. You'll see a
   workflow run start automatically. It takes about a minute. Green check =
   done.

5. Your app is now live at `https://YOUR_USERNAME.github.io/mhe-toolkit/`.

## Installing on iPhone

Open that link in Safari on your iPhone, tap the Share icon, then "Add to
Home Screen." It behaves like a native app — full screen, no browser bar.

## Making changes later

Send me what you want changed and I'll update `src/App.jsx`. Then just
re-upload that one file through the GitHub website (click into the file →
pencil/edit icon, or drag-and-drop to replace it) and commit — the workflow
rebuilds and redeploys automatically. No terminal required.

---

## Optional: local development (if you later get comfortable with a terminal)

```bash
npm install
npm run dev      # live preview while editing
npm run build    # production build
```
