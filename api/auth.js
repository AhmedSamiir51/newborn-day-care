import {
  clearUserSession,
  createUserSession,
  expiredSessionCookie,
  getSessionUser,
  hashPassword,
  isStrongEnoughPassword,
  normalizeEmail,
  normalizeName,
  sessionCookie,
  sql,
  verifyPassword,
} from "./_auth.js";
import { randomUUID } from "node:crypto";

export default async function handler(request, response) {
  if (!process.env.DATABASE_URL) {
    return response.status(500).json({ error: "DATABASE_URL is not configured." });
  }

  try {
    if (request.method === "GET") {
      const user = await getSessionUser(request);
      return response.status(200).json({ user });
    }

    if (request.method !== "POST") {
      response.setHeader("Allow", "GET, POST");
      return response.status(405).json({ error: "Method not allowed." });
    }

    const action = String(request.body?.action || "");

    if (action === "register") {
      return register(request, response);
    }

    if (action === "login") {
      return login(request, response);
    }

    if (action === "logout") {
      await clearUserSession(request);
      response.setHeader("Set-Cookie", expiredSessionCookie(request));
      return response.status(200).json({ ok: true });
    }

    return response.status(400).json({ error: "Unknown auth action." });
  } catch (error) {
    if (error?.code === "23505") {
      return response.status(409).json({ error: "This email is already registered." });
    }

    console.error(error);
    return response.status(500).json({ error: "Authentication request failed." });
  }
}

async function register(request, response) {
  const email = normalizeEmail(request.body?.email);
  const name = normalizeName(request.body?.name) || "Mama";
  const age = String(request.body?.age || "").trim().slice(0, 40);
  const password = String(request.body?.password || "");

  if (!email || !name || !isStrongEnoughPassword(password)) {
    return response.status(400).json({ error: "Valid email and password are required." });
  }

  const userId = randomUUID();
  const rows = await sql`
    insert into newborn_users (id, email, name, age, password_hash)
    values (${userId}, ${email}, ${name}, ${age}, ${hashPassword(password)})
    returning id, email, name, age
  `;

  await sql`
    insert into newborn_user_profiles (user_id, baby_name)
    values (${userId}, '')
    on conflict (user_id) do nothing
  `;

  const token = await createUserSession(userId);
  response.setHeader("Set-Cookie", sessionCookie(token, request));
  return response.status(201).json({ user: rows[0] });
}

async function login(request, response) {
  const email = normalizeEmail(request.body?.email);
  const password = String(request.body?.password || "");

  if (!email || !password) {
    return response.status(400).json({ error: "Email and password are required." });
  }

  const rows = await sql`
    select id, email, name, age, password_hash
    from newborn_users
    where email = ${email}
    limit 1
  `;

  const user = rows[0];
  if (!user || !verifyPassword(password, user.password_hash)) {
    return response.status(401).json({ error: "Invalid email or password." });
  }

  const token = await createUserSession(user.id);
  response.setHeader("Set-Cookie", sessionCookie(token, request));
  return response.status(200).json({ user: { id: user.id, email: user.email, name: user.name, age: user.age || "" } });
}
