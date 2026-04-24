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
  create table if not exists newborn_babies (
    id uuid primary key,
    user_id uuid not null references newborn_users(id) on delete cascade,
    name text not null,
    age text not null default '',
    gender text not null check (gender in ('girl', 'boy', 'other')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )
`;

await sql`
  create index if not exists newborn_babies_user_idx
  on newborn_babies (user_id, created_at)
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
  alter table newborn_user_events
  add column if not exists baby_id uuid references newborn_babies(id) on delete cascade
`;

await sql`
  create index if not exists newborn_user_events_user_date_time_idx
  on newborn_user_events (user_id, care_date, event_time desc, created_at desc)
`;

await sql`
  create index if not exists newborn_user_events_baby_date_time_idx
  on newborn_user_events (user_id, baby_id, care_date, event_time desc, created_at desc)
`;

await sql`
  insert into newborn_babies (id, user_id, name, age, gender)
  select gen_random_uuid(), p.user_id, p.baby_name, '', 'girl'
  from newborn_user_profiles p
  where not exists (
    select 1 from newborn_babies b where b.user_id = p.user_id
  )
`;

await sql`
  update newborn_user_events e
  set baby_id = b.id
  from (
    select distinct on (user_id) id, user_id
    from newborn_babies
    order by user_id, created_at asc
  ) b
  where e.user_id = b.user_id
    and e.baby_id is null
`;

await sql`
  create table if not exists newborn_medicines (
    id uuid primary key,
    user_id uuid not null references newborn_users(id) on delete cascade,
    baby_id uuid not null references newborn_babies(id) on delete cascade,
    name text not null,
    dose text not null,
    times_per_day int not null default 1,
    interval_hours int not null default 24,
    start_time time not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )
`;

await sql`
  create index if not exists newborn_medicines_baby_idx
  on newborn_medicines (user_id, baby_id, created_at desc)
`;

await sql`
  create table if not exists newborn_medicine_doses (
    id uuid primary key,
    medicine_id uuid not null references newborn_medicines(id) on delete cascade,
    user_id uuid not null references newborn_users(id) on delete cascade,
    baby_id uuid not null references newborn_babies(id) on delete cascade,
    scheduled_at timestamptz not null,
    taken_at timestamptz,
    created_at timestamptz not null default now()
  )
`;

await sql`
  create index if not exists newborn_medicine_doses_due_idx
  on newborn_medicine_doses (user_id, baby_id, taken_at, scheduled_at)
`;

console.log("Neon database is ready.");
