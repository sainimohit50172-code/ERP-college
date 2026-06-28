Deployment Guide — GitHub + Vercel

This repository is a Vite + React application. Follow these steps to push to GitHub and deploy to Vercel.

1) Create a GitHub repository

- Locally, in your project root run:

```bash
git init
git add .
git commit -m "Initial commit: ERP frontend"
# create a GitHub repo then add remote (replace <USERNAME> and <REPO> accordingly)
git remote add origin https://github.com/<USERNAME>/<REPO>.git
git branch -M main
git push -u origin main
```

2) Push code (if you already have a remote, just push):

```bash
git push origin main
```

3) Deploy on Vercel (recommended)

- Option A (recommended, UI):
  - Go to https://vercel.com and sign in with GitHub.
  - Choose "New Project" → Import from GitHub → select the repo you pushed.
  - Vercel auto-detects Vite; set build command `npm run build` and output directory `dist` (these are defaults).
  - Click "Deploy". You will get a live URL like `https://your-project.vercel.app`.

- Option B (Vercel CLI):
  - Install Vercel CLI: `npm i -g vercel`
  - Run `vercel login` and follow prompts.
  - From project root run `vercel --prod` and follow prompts.

4) Environment variables

- If your app uses runtime API keys or base URLs, add them in Vercel dashboard under Project Settings → Environment Variables.

5) Continuous deployment

- Every push to `main` will auto-trigger a Vercel deploy (if connected via GitHub).

6) If you want me to deploy for you

I can perform the GitHub push + Vercel deploy if you provide one of the following:
- A GitHub repository URL where I can push (or a Git remote URL and permission), OR
- A GitHub personal access token (PAT) with `repo` scope (not recommended to paste in chat), OR
- Grant me a temporary collaborator invite to the GitHub repo.

To deploy via Vercel programmatically I will need a Vercel token; easier is to connect via GitHub UI (I can guide you).

7) Troubleshooting

- If the app shows 404s on refresh, ensure `vercel.json` is present (SPA route fallback is configured).
- For environment differences between local and production, verify API base URLs and CORS settings.


If you want me to deploy the repo for you, reply with the GitHub repository URL or invite me as a collaborator and I'll push and finish the Vercel setup and return the live link.