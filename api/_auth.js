import { createHash, pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL);

const SESSION_COOKIE = "newborn_session";
const SESSION_DAYS = 30;

export async function getSessionUser(request) {
  const token = readCookie(request.headers.cookie || "", SESSION_COOKIE);
  if (!token) return null;

  const tokenHash = hashToken(token);
  const rows = await sql`
    select u.id, u.email, u.name, u.age
    from newborn_sessions s
    join newborn_users u on u.id = s.user_id
    where s.token_hash = ${tokenHash}
      and s.expires_at > now()
    limit 1
  `;

  return rows[0] || null;
}

export async function createUserSession(userId) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);

  await sql`
    insert into newborn_sessions (id, user_id, token_hash, expires_at)
    values (${randomUUID()}, ${userId}, ${tokenHash}, now() + interval '30 days')
  `;

  return token;
}

export async function clearUserSession(request) {
  const token = readCookie(request.headers.cookie || "", SESSION_COOKIE);
  if (!token) return;

  await sql`delete from newborn_sessions where token_hash = ${hashToken(token)}`;
}

export function sessionCookie(token, request) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const secure = isSecureRequest(request) ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${maxAge}`;
}

export function expiredSessionCookie(request) {
  const secure = isSecureRequest(request) ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=0`;
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("base64url");
  const hash = pbkdf2Sync(password, salt, 210000, 32, "sha256").toString("base64url");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;

  const inputHash = pbkdf2Sync(password, salt, 210000, 32, "sha256");
  const storedHash = Buffer.from(hash, "base64url");

  return storedHash.length === inputHash.length && timingSafeEqual(storedHash, inputHash);
}

export function normalizeEmail(email) {
  const value = String(email || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : "";
}

export function normalizeName(name) {
  return String(name || "").trim().slice(0, 80);
}

export function isStrongEnoughPassword(password) {
  return String(password || "").length >= 6;
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function readCookie(cookieHeader, name) {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function isSecureRequest(request) {
  const host = request?.headers?.host || "";
  const proto = request?.headers?.["x-forwarded-proto"];
  return proto === "https" || (!host.startsWith("localhost") && !host.startsWith("127.0.0.1"));
}
