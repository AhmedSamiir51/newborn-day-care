import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to initialize the database.");
}

const sql = neon(process.env.DATABASE_URL);

await sql`
  create table if not exists newborn_day_profile (
    id text primary key,
    baby_name text not null default 'Baby girl',
    updated_at timestamptz not null default now()
  )
`;

await sql`
  create table if not exists newborn_day_events (
    id text primary key,
    care_date date not null,
    type text not null check (type in ('feeding', 'diaper', 'medicine', 'sleep', 'note')),
    event_time time not null,
    details jsonb not null default '{}'::jsonb,
    note text not null default '',
    created_at timestamptz not null default now()
  )
`;

await sql`
  create index if not exists newborn_day_events_date_time_idx
  on newborn_day_events (care_date, event_time desc, created_at desc)
`;

await sql`
  insert into newborn_day_profile (id, baby_name)
  values ('default', 'Baby girl')
  on conflict (id) do nothing
`;

await sql`
  create table if not exists newborn_users (
    id uuid primary key,
    email text not null unique,
    name text not null,
    password_hash text not null,
    created_at timestamptz not null default now()
  )
`;

await sql`
  create table if not exists newborn_sessions (
    id uuid primary key,
    user_id uuid not null references newborn_users(id) on delete cascade,
    token_hash text not null unique,
    expires_at timestamptz not null,
    created_at timestamptz not null default now()
  )
`;

await sql`
  create index if not exists newborn_sessions_user_idx
  on newborn_sessions (user_id)
`;

await sql`
  create table if not exists newborn_user_profiles (
    user_id uuid primary key references newborn_users(id) on delete cascade,
    baby_name text not null default 'Baby girl',
    updated_at timestamptz not null default now()
  )
`;

await sql`
  create table if not exists newborn_user_events (
    id text primary key,
    user_id uuid not null references newborn_users(id) on delete cascade,
    care_date date not null,
    type text not null check (type in ('feeding', 'diaper', 'medicine', 'sleep', 'note')),
    event_time time not null,
    details jsonb not null default '{}'::jsonb,
    note text not null default '',
    created_at timestamptz not null default now()
  )
`;

await sql`
  create index if not exists newborn_user_events_user_date_time_idx
  on newborn_user_events (user_id, care_date, event_time desc, created_at desc)
`;

console.log("Neon database is ready.");
