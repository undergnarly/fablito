# Fablito

Personalized AI storybooks for children.

## Stack

- Next.js 15 (App Router)
- Google Gemini (text + image generation)
- Vercel KV + Blob Storage
- Tailwind CSS + shadcn/ui

## Setup

```bash
cp .env.local.example .env.local
pnpm install
pnpm dev
```

## Environment

```
GOOGLE_API_KEY=         # Gemini API
OPENAI_API_KEY=         # GPT-4o for stories
KV_REST_API_URL=        # Vercel KV
KV_REST_API_TOKEN=      # Vercel KV
BLOB_READ_WRITE_TOKEN=  # Vercel Blob
ADMIN_PASSWORD=         # Admin panel
```

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/undergnarly/fablito)

## License

MIT
