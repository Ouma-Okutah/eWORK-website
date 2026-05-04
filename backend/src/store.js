import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { seedBranches, seedCourses } from "./seed.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, "..", "data", "db.json");

const initialState = {
  users: [],
  courses: seedCourses,
  branches: seedBranches,
  enrollments: [],
  progress: [],
  assessments: [],
  certificates: [],
  meetings: [],
  messages: [],
  payments: []
};

let state;

export async function loadStore() {
  if (state) return state;
  try {
    state = JSON.parse(await readFile(dataPath, "utf8"));
  } catch {
    state = structuredClone(initialState);
    await saveStore();
  }
  return state;
}

export async function saveStore() {
  await mkdir(dirname(dataPath), { recursive: true });
  await writeFile(dataPath, JSON.stringify(state, null, 2));
}

export async function getStore() {
  return loadStore();
}

export function publicUser(user) {
  if (!user) return null;
  const { passwordHash, passwordSalt, ...safeUser } = user;
  return safeUser;
}

export function nowIso() {
  return new Date().toISOString();
}

export function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
