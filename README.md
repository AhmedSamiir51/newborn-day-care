# Newborn Day Care

A gentle one-day care tracker for a newborn baby girl. It logs feedings, diaper changes, medicine, sleep, and notes to Neon Postgres through Vercel API routes.

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
