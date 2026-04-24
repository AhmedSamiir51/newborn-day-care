import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(request, response) {
  if (!process.env.DATABASE_URL) {
    return response.status(500).json({ error: "DATABASE_URL is not configured." });
  }

  try {
    if (request.method === "GET") {
      return getDay(request, response);
    }

    if (request.method === "POST") {
      return createEntry(request, response);
    }

    if (request.method === "PUT") {
      return updateProfile(request, response);
    }

    if (request.method === "DELETE") {
      return deleteEntryOrDay(request, response);
    }

    response.setHeader("Allow", "GET, POST, PUT, DELETE");
    return response.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Database request failed." });
  }
}

async function getDay(request, response) {
  const careDate = readCareDate(request);
  if (!careDate) {
    return response.status(400).json({ error: "A valid care date is required." });
  }

  const profileRows = await sql`
    select baby_name
    from newborn_day_profile
    where id = 'default'
  `;

  const entries = await sql`
    select
      id,
      type,
      to_char(event_time, 'HH24:MI') as time,
      details,
      note
    from newborn_day_events
    where care_date = ${careDate}
    order by event_time desc, created_at desc
  `;

  return response.status(200).json({
    babyName: profileRows[0]?.baby_name || "Baby girl",
    entries,
  });
}

async function createEntry(request, response) {
  const body = request.body || {};
  const careDate = normalizeDate(body.careDate);
  const entry = normalizeEntry(body.entry);

  if (!careDate || !entry) {
    return response.status(400).json({ error: "A valid entry and care date are required." });
  }

  const rows = await sql.query(
    `
      insert into newborn_day_events (id, care_date, type, event_time, details, note)
      values ($1, $2, $3, $4, $5::jsonb, $6)
      returning id, type, to_char(event_time, 'HH24:MI') as time, details, note
    `,
    [entry.id, careDate, entry.type, entry.time, JSON.stringify(entry.details), entry.note]
  );

  return response.status(201).json({ entry: rows[0] });
}

async function updateProfile(request, response) {
  const babyName = String(request.body?.babyName || "").trim().slice(0, 80) || "Baby girl";

  const rows = await sql`
    insert into newborn_day_profile (id, baby_name, updated_at)
    values ('default', ${babyName}, now())
    on conflict (id)
    do update set baby_name = excluded.baby_name, updated_at = now()
    returning baby_name
  `;

  return response.status(200).json({ babyName: rows[0].baby_name });
}

async function deleteEntryOrDay(request, response) {
  const url = new URL(request.url, `https://${request.headers.host || "localhost"}`);
  const id = url.searchParams.get("id");
  const careDate = normalizeDate(url.searchParams.get("date"));

  if (id) {
    await sql`delete from newborn_day_events where id = ${id}`;
    return response.status(204).end();
  }

  if (careDate) {
    await sql`delete from newborn_day_events where care_date = ${careDate}`;
    return response.status(204).end();
  }

  return response.status(400).json({ error: "An entry id or care date is required." });
}

function readCareDate(request) {
  const url = new URL(request.url, `https://${request.headers.host || "localhost"}`);
  return normalizeDate(url.searchParams.get("date"));
}

function normalizeDate(value) {
  const text = String(value || "");
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function normalizeTime(value) {
  const text = String(value || "");
  return /^\d{2}:\d{2}$/.test(text) ? text : null;
}

function normalizeEntry(entry) {
  if (!entry || typeof entry !== "object") return null;

  const type = String(entry.type || "");
  const time = normalizeTime(entry.time);
  const details = entry.details && typeof entry.details === "object" ? entry.details : {};

  if (!["feeding", "diaper", "medicine", "sleep", "note"].includes(type) || !time) {
    return null;
  }

  return {
    id: String(entry.id || crypto.randomUUID()),
    type,
    time,
    details,
    note: String(entry.note || "").slice(0, 500),
  };
}
