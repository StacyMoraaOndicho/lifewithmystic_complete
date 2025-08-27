# lifewithmystic

A burgundy, Substrata-inspired blog with Netlify CMS, search, categories, and a tiny static build.

## Quick Start (Netlify recommended)
1. Push this repo to GitHub.
2. On Netlify: **New site from Git**, pick the repo.
3. Build command: `npm run build` · Publish directory: `dist`
4. After deploy, go to **Site settings → Identity → Enable Identity**, then enable **Git Gateway** under Identity > Services.
5. Visit `/admin/` to log in and create posts.

## Local build
```bash
npm install
npm run build
# open dist/index.html
```

## Write posts
- Go to `/admin/` and create new entries, or add markdown files under `content/posts`.
- Fields: title, date, category (poetry/journal), tags, excerpt, body.

## Project layout
- content/posts → your markdown posts.
- static → raw static assets copied to dist.
- templates → HTML templates combined at build.
- dist → output site.
- admin → Netlify CMS.
- build.mjs → build script.