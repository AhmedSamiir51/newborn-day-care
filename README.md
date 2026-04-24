# Newborn Day Care

A gentle one-day care tracker for newborn care. It supports Arabic and English, email/password registration, multiple babies per user, baby name/age/gender profiles, and per-baby feedings, diaper changes, medicine, sleep, and notes stored in Neon Postgres through Vercel API routes.

## Run locally

```bash
npm install
npm run dev
```

For database-backed API routes, create `.env.local` with:

```bash
DATABASE_URL="your-neon-postgres-connection-string"
```

Initialize the Neon tables:

```bash
npm run db:init
```

## Build

```bash
npm run build
```
