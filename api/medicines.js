import { randomUUID } from "node:crypto";
import { getSessionUser, sql } from "./_auth.js";

export default async function handler(request, response) {
  if (!process.env.DATABASE_URL) {
    return response.status(500).json({ error: "DATABASE_URL is not configured." });
  }

  const user = await getSessionUser(request);
  if (!user) {
    return response.status(401).json({ error: "Login required." });
  }

  try {
    if (request.method === "GET") {
      return getMedicines(request, response, user);
    }

    if (request.method === "POST") {
      return createMedicine(request, response, user);
    }

    if (request.method === "PUT") {
      if (request.body?.action === "update") {
        return updateMedicine(request, response, user);
      }

      return markDoseTaken(request, response, user);
    }

    if (request.method === "DELETE") {
      return deleteMedicine(request, response, user);
    }

    response.setHeader("Allow", "GET, POST, PUT, DELETE");
    return response.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Medicine request failed." });
  }
}

async function getMedicines(request, response, user) {
  const babyId = readBabyId(request);
  if (!babyId || !(await canUseBaby(user.id, babyId))) {
    return response.status(400).json({ error: "A valid baby is required." });
  }

  const medicines = await sql`
    select
      id,
      name,
      dose,
      times_per_day,
      duration_days,
      to_char(start_date, 'YYYY-MM-DD') as start_date,
      to_char(start_time, 'HH24:MI') as start_time
    from newborn_medicines
    where user_id = ${user.id} and baby_id = ${babyId}
    order by created_at desc
  `;

  const dueDoses = await sql`
    select
      d.id,
      d.medicine_id,
      m.name,
      m.dose,
      to_char(d.scheduled_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as scheduled_at
    from newborn_medicine_doses d
    join newborn_medicines m on m.id = d.medicine_id
    where d.user_id = ${user.id}
      and d.baby_id = ${babyId}
      and d.taken_at is null
      and d.scheduled_at <= now()
    order by d.scheduled_at asc
  `;

  return response.status(200).json({ medicines, dueDoses });
}

async function createMedicine(request, response, user) {
  const babyId = String(request.body?.babyId || "");
  const medicine = normalizeMedicine(request.body);

  if (!babyId || !medicine || !(await canUseBaby(user.id, babyId))) {
    return response.status(400).json({ error: "Valid medicine details are required." });
  }

  const medicineId = randomUUID();
  const rows = await sql`
    insert into newborn_medicines (
      id, user_id, baby_id, name, dose, times_per_day, interval_hours, duration_days, start_date, start_time
    )
    values (
      ${medicineId},
      ${user.id},
      ${babyId},
      ${medicine.name},
      ${medicine.dose},
      ${medicine.timesPerDay},
      ${medicine.intervalHours},
      ${medicine.durationDays},
      ${medicine.startDate},
      ${medicine.startTime}
    )
    returning id, name, dose, times_per_day, duration_days, to_char(start_date, 'YYYY-MM-DD') as start_date, to_char(start_time, 'HH24:MI') as start_time
  `;

  const schedule = buildSchedule(medicine);
  for (const scheduledAt of schedule) {
    await sql`
      insert into newborn_medicine_doses (id, medicine_id, user_id, baby_id, scheduled_at)
      values (${randomUUID()}, ${medicineId}, ${user.id}, ${babyId}, ${scheduledAt.toISOString()})
    `;
  }

  return response.status(201).json({ medicine: rows[0] });
}

async function updateMedicine(request, response, user) {
  const medicineId = String(request.body?.id || "");
  const babyId = String(request.body?.babyId || "");
  const medicine = normalizeMedicine(request.body);

  if (!medicineId || !babyId || !medicine || !(await canUseBaby(user.id, babyId))) {
    return response.status(400).json({ error: "Valid medicine details are required." });
  }

  const rows = await sql`
    update newborn_medicines
    set
      name = ${medicine.name},
      dose = ${medicine.dose},
      times_per_day = ${medicine.timesPerDay},
      interval_hours = ${medicine.intervalHours},
      duration_days = ${medicine.durationDays},
      start_date = ${medicine.startDate},
      start_time = ${medicine.startTime},
      updated_at = now()
    where id = ${medicineId}
      and user_id = ${user.id}
      and baby_id = ${babyId}
    returning id, name, dose, times_per_day, duration_days, to_char(start_date, 'YYYY-MM-DD') as start_date, to_char(start_time, 'HH24:MI') as start_time
  `;

  if (!rows[0]) {
    return response.status(404).json({ error: "Medicine not found." });
  }

  await sql`
    delete from newborn_medicine_doses
    where medicine_id = ${medicineId}
      and user_id = ${user.id}
      and taken_at is null
  `;

  const schedule = buildSchedule(medicine);
  for (const scheduledAt of schedule) {
    await sql`
      insert into newborn_medicine_doses (id, medicine_id, user_id, baby_id, scheduled_at)
      values (${randomUUID()}, ${medicineId}, ${user.id}, ${babyId}, ${scheduledAt.toISOString()})
    `;
  }

  return response.status(200).json({ medicine: rows[0] });
}

async function markDoseTaken(request, response, user) {
  const doseId = String(request.body?.doseId || "");
  if (!doseId) {
    return response.status(400).json({ error: "Dose id is required." });
  }

  const rows = await sql`
    update newborn_medicine_doses
    set taken_at = now()
    where id = ${doseId} and user_id = ${user.id}
    returning id, baby_id, medicine_id, to_char(scheduled_at, 'HH24:MI') as event_time
  `;

  if (!rows[0]) {
    return response.status(404).json({ error: "Dose not found." });
  }

  const medicineRows = await sql`
    select name, dose from newborn_medicines where id = ${rows[0].medicine_id} and user_id = ${user.id}
  `;

  const medicine = medicineRows[0];
  if (medicine) {
    await sql.query(
      `
        insert into newborn_user_events (id, user_id, baby_id, care_date, type, event_time, details, note)
        values ($1, $2, $3, current_date, 'medicine', $4, $5::jsonb, $6)
      `,
      [
        randomUUID(),
        user.id,
        rows[0].baby_id,
        rows[0].event_time,
        JSON.stringify({ medicine: medicine.name, dose: medicine.dose }),
        "Scheduled medicine taken",
      ]
    );
  }

  return response.status(200).json({ ok: true });
}

async function deleteMedicine(request, response, user) {
  const url = new URL(request.url, `https://${request.headers.host || "localhost"}`);
  const id = url.searchParams.get("id");
  if (!id) {
    return response.status(400).json({ error: "Medicine id is required." });
  }

  await sql`delete from newborn_medicines where id = ${id} and user_id = ${user.id}`;
  return response.status(204).end();
}

function normalizeMedicine(body) {
  const name = String(body?.name || "").trim().slice(0, 100);
  const dose = String(body?.dose || "").trim().slice(0, 80);
  const timesPerDay = clamp(Number(body?.timesPerDay || 1), 1, 12);
  const intervalHours = Math.max(1, Math.floor(24 / timesPerDay));
  const durationDays = clamp(Number(body?.durationDays || 1), 1, 365);
  const startDate = normalizeDate(body?.startDate) || new Date().toISOString().slice(0, 10);
  const startTime = normalizeTime(body?.startTime);

  if (!name || !dose || !startTime) return null;
  return { name, dose, timesPerDay, intervalHours, durationDays, startDate, startTime };
}

function buildSchedule(medicine) {
  const [hours, minutes] = medicine.startTime.split(":").map(Number);
  const [year, month, dayOfMonth] = medicine.startDate.split("-").map(Number);
  const schedule = [];
  const start = new Date(Date.UTC(year, month - 1, dayOfMonth, hours, minutes, 0, 0));

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + medicine.durationDays);

  for (let day = new Date(start); day < end; day.setUTCDate(day.getUTCDate() + 1)) {
    const dailyLimit = medicine.timesPerDay;
    for (let doseIndex = 0; doseIndex < dailyLimit; doseIndex += 1) {
      const doseTime = new Date(day);
      doseTime.setUTCHours(hours + doseIndex * medicine.intervalHours, minutes, 0, 0);
      if (doseTime < end) schedule.push(doseTime);
    }
  }

  return schedule;
}

function readBabyId(request) {
  const url = new URL(request.url, `https://${request.headers.host || "localhost"}`);
  return url.searchParams.get("babyId");
}

async function canUseBaby(userId, babyId) {
  const rows = await sql`
    select 1 from newborn_babies where id = ${babyId} and user_id = ${userId} limit 1
  `;
  return Boolean(rows[0]);
}

function normalizeTime(value) {
  const text = String(value || "");
  return /^\d{2}:\d{2}$/.test(text) ? text : "";
}

function normalizeDate(value) {
  const text = String(value || "");
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}
