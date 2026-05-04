import "dotenv/config";
import express from "express";
import cors from "cors";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword, requireAdmin, requireAuth, signToken, verifyPassword } from "./auth.js";
import { getStore, makeId, nowIso, publicUser, saveStore } from "./store.js";
import { recommendPath } from "./recommendations.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendPath = join(__dirname, "..", "..");
const app = express();
const port = Number(process.env.PORT || 4000);
const appOrigin = process.env.APP_ORIGIN || "*";
const jitsiBaseUrl = process.env.JITSI_BASE_URL || "https://meet.jit.si";

app.use(cors({ origin: appOrigin === "*" ? true : appOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "ework-ai-api", time: nowIso() });
});

app.post("/api/auth/register", async (req, res) => {
  const { fullName, email, phone, country, password, profile = {} } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "Full name, email, and password are required" });
  }

  const db = await getStore();
  const normalizedEmail = email.toLowerCase().trim();
  if (db.users.some((user) => user.email === normalizedEmail)) {
    return res.status(409).json({ error: "Email is already registered" });
  }

  const passwordFields = hashPassword(password);
  const user = {
    id: makeId("usr"),
    fullName,
    email: normalizedEmail,
    phone,
    country,
    profile,
    role: db.users.length === 0 ? "admin" : "student",
    createdAt: nowIso(),
    ...passwordFields
  };

  db.users.push(user);
  await saveStore();

  res.status(201).json({
    user: publicUser(user),
    token: signToken({ sub: user.id, role: user.role })
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const db = await getStore();
  const user = db.users.find((item) => item.email === String(email || "").toLowerCase().trim());
  if (!user || !verifyPassword(password || "", user)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  res.json({ user: publicUser(user), token: signToken({ sub: user.id, role: user.role }) });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.publicUser });
});

app.get("/api/courses", async (req, res) => {
  const db = await getStore();
  const { level } = req.query;
  const courses = level ? db.courses.filter((course) => course.level === level) : db.courses;
  res.json({ courses });
});

app.get("/api/courses/:id", async (req, res) => {
  const db = await getStore();
  const course = db.courses.find((item) => item.id === req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });
  res.json({ course });
});

app.get("/api/branches", async (_req, res) => {
  const db = await getStore();
  res.json({ branches: db.branches });
});

app.post("/api/assessments/placement", requireAuth, async (req, res) => {
  const { answers = [], profile = req.user.profile || {} } = req.body;
  const score =
    answers.length > 0
      ? Math.round((answers.filter((answer) => answer.correct || answer.value === true).length / answers.length) * 100)
      : Number(req.body.score || 0);
  const recommendation = recommendPath(profile, score);

  const db = await getStore();
  const assessment = {
    id: makeId("asm"),
    userId: req.user.id,
    type: "placement",
    score,
    profile,
    recommendation,
    createdAt: nowIso()
  };
  db.assessments.push(assessment);
  await saveStore();

  res.status(201).json({ assessment });
});

app.post("/api/enrollments", requireAuth, async (req, res) => {
  const { courseId, paymentMethod = "pending", installmentPlan = false } = req.body;
  const db = await getStore();
  const course = db.courses.find((item) => item.id === courseId);
  if (!course) return res.status(404).json({ error: "Course not found" });

  const enrollment = {
    id: makeId("enr"),
    userId: req.user.id,
    courseId,
    status: "active",
    paymentStatus: "pending",
    paymentMethod,
    installmentPlan,
    mentor: "Assigned after onboarding",
    createdAt: nowIso()
  };
  db.enrollments.push(enrollment);
  db.progress.push({
    id: makeId("prg"),
    userId: req.user.id,
    courseId,
    completedModules: [],
    percentComplete: 0,
    nextLesson: course.modules[0],
    updatedAt: nowIso()
  });
  await saveStore();

  res.status(201).json({ enrollment });
});

app.get("/api/me/dashboard", requireAuth, async (req, res) => {
  const db = await getStore();
  const enrollments = db.enrollments.filter((item) => item.userId === req.user.id);
  const progress = db.progress.filter((item) => item.userId === req.user.id);
  const certificates = db.certificates.filter((item) => item.userId === req.user.id);
  const messages = db.messages.filter((item) => item.userId === req.user.id || item.audience === "all");

  res.json({
    user: req.publicUser,
    enrollments,
    progress,
    certificates,
    messages,
    paymentStatus: enrollments[0]?.paymentStatus || "none",
    assignedMentor: enrollments[0]?.mentor || "Not assigned",
    upcomingLiveSessions: db.meetings.slice(-3)
  });
});

app.patch("/api/progress/:courseId", requireAuth, async (req, res) => {
  const db = await getStore();
  const progress = db.progress.find((item) => item.userId === req.user.id && item.courseId === req.params.courseId);
  if (!progress) return res.status(404).json({ error: "Progress record not found" });

  progress.completedModules = req.body.completedModules || progress.completedModules;
  progress.percentComplete = Number(req.body.percentComplete ?? progress.percentComplete);
  progress.nextLesson = req.body.nextLesson || progress.nextLesson;
  progress.updatedAt = nowIso();
  await saveStore();

  res.json({ progress });
});

app.post("/api/certificates", requireAuth, async (req, res) => {
  const { courseId } = req.body;
  const db = await getStore();
  const course = db.courses.find((item) => item.id === courseId);
  if (!course) return res.status(404).json({ error: "Course not found" });

  const certificate = {
    id: makeId("cert"),
    userId: req.user.id,
    courseId,
    title: course.title,
    certificateType: course.certificateType,
    verificationCode: `EWK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    issuedAt: nowIso()
  };
  db.certificates.push(certificate);
  await saveStore();

  res.status(201).json({ certificate });
});

app.get("/api/certificates/verify/:code", async (req, res) => {
  const db = await getStore();
  const certificate = db.certificates.find((item) => item.verificationCode === req.params.code.toUpperCase());
  if (!certificate) return res.status(404).json({ valid: false });
  res.json({ valid: true, certificate });
});

app.post("/api/meetings", requireAuth, async (req, res) => {
  const title = req.body.title || "eWORK AI Class";
  const roomName = `ework-ai-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const meeting = {
    id: makeId("mtg"),
    title,
    roomName,
    joinUrl: `${jitsiBaseUrl}/${roomName}`,
    hostUserId: req.user.id,
    startsAt: req.body.startsAt || nowIso(),
    createdAt: nowIso()
  };

  const db = await getStore();
  db.meetings.push(meeting);
  await saveStore();
  res.status(201).json({ meeting });
});

app.get("/api/meetings/:id", async (req, res) => {
  const db = await getStore();
  const meeting = db.meetings.find((item) => item.id === req.params.id || item.roomName === req.params.id);
  if (!meeting) return res.status(404).json({ error: "Meeting not found" });
  res.json({ meeting });
});

app.get("/api/messages", requireAuth, async (req, res) => {
  const db = await getStore();
  const messages = db.messages.filter((item) => item.userId === req.user.id || item.audience === "all");
  res.json({ messages });
});

app.post("/api/messages", requireAuth, async (req, res) => {
  const message = {
    id: makeId("msg"),
    userId: req.body.userId || req.user.id,
    fromUserId: req.user.id,
    audience: req.body.audience || "student",
    channel: req.body.channel || "support",
    body: req.body.body,
    createdAt: nowIso()
  };
  if (!message.body) return res.status(400).json({ error: "Message body is required" });

  const db = await getStore();
  db.messages.push(message);
  await saveStore();
  res.status(201).json({ message });
});

app.get("/api/admin/summary", requireAuth, requireAdmin, async (_req, res) => {
  const db = await getStore();
  res.json({
    students: db.users.filter((user) => user.role === "student").length,
    courses: db.courses.length,
    enrollments: db.enrollments.length,
    paymentsPending: db.enrollments.filter((item) => item.paymentStatus === "pending").length,
    certificatesIssued: db.certificates.length,
    meetings: db.meetings.length
  });
});

app.use(express.static(frontendPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(join(frontendPath, "index.html"));
});

app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

await getStore();
app.listen(port, () => {
  console.log(`eWORK AI API running on http://localhost:${port}`);
});
