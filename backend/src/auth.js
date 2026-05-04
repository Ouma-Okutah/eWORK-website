import crypto from "node:crypto";
import { getStore, publicUser } from "./store.js";

const tokenSecret = process.env.TOKEN_SECRET || "dev-secret-change-me";

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  return { passwordHash: hash, passwordSalt: salt };
}

export function verifyPassword(password, user) {
  const { passwordHash } = hashPassword(password, user.passwordSalt);
  return crypto.timingSafeEqual(Buffer.from(passwordHash, "hex"), Buffer.from(user.passwordHash, "hex"));
}

export function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 })
  ).toString("base64url");
  const signature = crypto.createHmac("sha256", tokenSecret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token) {
  const [header, body, signature] = token.split(".");
  if (!header || !body || !signature) return null;
  const expected = crypto.createHmac("sha256", tokenSecret).update(`${header}.${body}`).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

//asynchronous function to require authentication
export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const payload = token ? verifyToken(token) : null;
  if (!payload?.sub) return res.status(401).json({ error: "Authentication required" });

  const db = await getStore();
  const user = db.users.find((item) => item.id === payload.sub);
  if (!user) return res.status(401).json({ error: "Invalid session" });

  req.user = user;
  req.publicUser = publicUser(user);
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  next();
}
