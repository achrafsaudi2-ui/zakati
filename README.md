# Zakati

> Multi-currency, on-device zakat calculator. Built as sadaqah jariyah.

## Structure

```
zakati/
├── apps/
│   ├── web/                  Next.js 15 app (consumer-facing)
│   └── studio/               Sanity Studio (CMS admin)
└── packages/
    ├── zakat-engine/         Pure-function zakat engine (3 methodology views)
    └── document-pipeline/    Tiered PDF/OCR/AI extraction (all on-device)
```

## Develop

```bash
pnpm install
pnpm web:dev       # → http://localhost:3000
pnpm studio:dev    # → http://localhost:3333
pnpm engine:test   # validate engine — 3 views must pass within 4%
```

## Environment

Copy `apps/web/.env.example` to `apps/web/.env.local`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

Without these, the app uses mock data for the charity directory — handy for
local dev. Production deployments should always set real values.

## Deploy to Cloudflare Pages

Deployed via [`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages).

### One-time setup

```bash
pnpm --filter @zakati/web exec wrangler login

pnpm --filter @zakati/web exec wrangler pages project create zakati \
  --production-branch main

pnpm --filter @zakati/web exec wrangler pages secret put \
  NEXT_PUBLIC_SANITY_PROJECT_ID --project-name zakati
```

### Manual deploy from your machine

```bash
pnpm --filter @zakati/web deploy
```

The adapter produces a Workers-compatible bundle in
`apps/web/.vercel/output/static`, then `wrangler` pushes it.

### Automated deploy via GitHub Actions

`.github/workflows/deploy.yml` runs on every push to `main` and on PRs (preview
deployments). Required repo secrets:

| Secret | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | API token with `Pages: Edit` |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID (public) |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |

### Custom domain

In Cloudflare dashboard → Pages → `zakati` → Custom domains, add `zakati.app`.
DNS records are managed automatically if the zone is on Cloudflare.

Sanity Studio deploys separately to `studio.zakati.app` via
`pnpm --filter @zakati/studio sanity deploy`.

## Architecture notes

- **State**: Zustand + immer + persist (localStorage only). No accounts.
- **Engine** (`@zakati/engine`): pure functions, view-aware (Strict / Moderate / Lenient).
- **Pipeline** (`@zakati/document-pipeline`): three-tier on-device extraction.
  - Tier 1: PDF.js text extraction (0 MB, ~200ms/page)
  - Tier 2: Tesseract OCR (2 MB, ~3s/page)
  - Tier 3: WebLLM Phi-3.5-mini (500 MB, opt-in only)
- **CMS**: Sanity, fetched once per session via `lib/cms/client.ts`.
- **Fonts**: Inter (body), Geist (display), Cormorant Garamond (Z mark, big numbers).
- **No tracking** in v1. No analytics. No ads. Ever.
