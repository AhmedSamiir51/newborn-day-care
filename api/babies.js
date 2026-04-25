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
      const babies = await sql`
        select id, name, age, gender
        from newborn_babies
        where user_id = ${user.id}
        order by created_at asc
      `;
      return response.status(200).json({ babies });
    }

    if (request.method === "POST") {
      const baby = normalizeBaby(request.body);
      if (!baby) {
        return response.status(400).json({ error: "Valid baby details are required." });
      }

      const rows = await sql`
        insert into newborn_babies (id, user_id, name, age, gender)
        values (${randomUUID()}, ${user.id}, ${baby.name}, ${baby.age}, ${baby.gender})
        returning id, name, age, gender
      `;
      return response.status(201).json({ baby: rows[0] });
    }

    if (request.method === "PUT") {
      const id = String(request.body?.id || "");
      const baby = normalizeBaby(request.body);
      if (!id || !baby) {
        return response.status(400).json({ error: "Valid baby details are required." });
      }

      const rows = await sql`
        update newborn_babies
        set name = ${baby.name}, age = ${baby.age}, gender = ${baby.gender}, updated_at = now()
        where id = ${id} and user_id = ${user.id}
        returning id, name, age, gender
      `;

      if (!rows[0]) {
        return response.status(404).json({ error: "Baby not found." });
      }

      return response.status(200).json({ baby: rows[0] });
    }

    if (request.method === "DELETE") {
      const url = new URL(request.url, `https://${request.headers.host || "localhost"}`);
      const id = url.searchParams.get("id");

      if (!id) {
        return response.status(400).json({ error: "Baby id is required." });
      }

      await sql`delete from newborn_babies where id = ${id} and user_id = ${user.id}`;
      return response.status(204).end();
    }

    response.setHeader("Allow", "GET, POST, PUT, DELETE");
    return response.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Baby request failed." });
  }
}

function normalizeBaby(body) {
  const name = String(body?.name || "").trim().slice(0, 80);
  const age = String(body?.age || "").trim().slice(0, 40);
  const gender = String(body?.gender || "").trim();

  if (!name || !["girl", "boy", "other"].includes(gender)) {
    return null;
  }

  return { name, age, gender };
}
