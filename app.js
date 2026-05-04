const branches = [
  ["ML", "Machine Learning", "Prediction, classification, regression, and model evaluation."],
  ["DL", "Deep Learning", "Neural networks for complex patterns in text, image, and signals."],
  ["GA", "Generative AI", "Prompting, assistants, content generation, and model workflows."],
  ["NL", "Natural Language Processing", "Text analytics, chatbots, embeddings, and search."],
  ["CV", "Computer Vision", "Image classification, detection, inspection, and visual AI apps."],
  ["AB", "AI for Business", "Automation, decision support, customer operations, and strategy."],
  ["DS", "AI for Data Science", "Analytics, notebooks, model experiments, and data products."],
  ["AG", "AI Automation / Agents", "Multi-step AI workflows, tools, APIs, and agent systems."],
  ["MO", "MLOps", "Deployment, monitoring, versioning, governance, and reliability."],
  ["RI", "Robotics / Intelligent Systems", "Perception, planning, sensors, and intelligent machines."],
  ["RL", "Reinforcement Learning", "Agents that learn through rewards, policies, and simulation."],
  ["EA", "Ethical AI / Responsible AI", "Fairness, privacy, safety, compliance, and human oversight."]
];

const levels = [
  {
    id: "level-1-foundation",
    title: "Level 1: Beginner Foundation",
    duration: "8 weeks",
    certificate: "Foundation certificate",
    modules: [
      "AI basics",
      "Data basics",
      "Python basics",
      "Introduction to prompt engineering",
      "AI tools overview"
    ]
  },
  {
    id: "level-2-applied-skills",
    title: "Level 2: Intermediate Applied Skills",
    duration: "10 weeks",
    certificate: "Applied skills certificate",
    modules: [
      "Supervised and unsupervised learning",
      "Model training",
      "Data preprocessing",
      "API integration",
      "Practical AI projects"
    ]
  },
  {
    id: "level-3-professional",
    title: "Level 3: Advanced Professional Specialization",
    duration: "12 weeks",
    certificate: "Professional certificate",
    modules: [
      "Model deployment",
      "AI product building",
      "MLOps",
      "AI architecture",
      "Fine-tuning and automation",
      "Real-world capstone"
    ]
  }
];

const specialCourses = [
  "AI for healthcare",
  "AI for finance",
  "AI for education",
  "AI for marketing",
  "AI for HR",
  "AI for content creation",
  "AI for software developers",
  "AI for entrepreneurs",
  "AI agents and automation",
  "Computer vision applications"
];

const processSteps = [
  ["Select your field", "Choose the industry or profession you want your examples and projects to match."],
  ["Take assessment", "Complete a placement test that checks AI, data, coding, and workflow readiness."],
  ["Get recommended level", "Receive a clear recommendation for Level 1, Level 2, Level 3, or a special course."],
  ["Enroll and pay", "Choose card, mobile money, bank transfer, PayPal, Stripe, or installments."],
  ["Access dashboard", "Open your course roadmap, live classes, assignments, mentor, and certificates."],
  ["Track outcomes", "Use analytics, feedback, and project reviews to measure skill growth."]
];

const pricing = [
  ["Level 1", "$149", "Beginner foundation", ["AI basics", "Python basics", "Prompt engineering"]],
  ["Level 2", "$299", "Applied project track", ["Model training", "API integration", "Mentor feedback"]],
  ["Level 3", "$499", "Professional specialization", ["MLOps", "Deployment", "Capstone review"]],
  ["Special Courses", "From $99", "Topic-based training", ["Industry tracks", "Focused projects", "Fast enrollment"]],
  ["Corporate / Teams", "Custom", "Managed training", ["Admin reports", "Instructor assignment", "Team analytics"]],
  ["Installments", "Flexible", "Optional payment plans", ["Split payments", "Portal status", "Payment support"]]
];

const apiStack = [
  "User API for accounts and authentication",
  "Course API for content and modules",
  "Enrollment API for registration and payments",
  "Progress API for student activity",
  "Certificate API for certificate generation",
  "Assessment API for quizzes and results",
  "Notification API for email, SMS, and WhatsApp",
  "AI Recommendation API for personalized paths",
  "Payment API for Stripe, PayPal, and mobile money",
  "Admin API for staff workflows"
];

let currentStep = 1;
let meetingApi = null;
const apiBaseUrl = localStorage.getItem("eworkApiBaseUrl") || "http://localhost:4000/api";
let authToken = localStorage.getItem("eworkAuthToken") || "";
let currentUser = JSON.parse(localStorage.getItem("eworkUser") || "null");
let callState = {
  audioMuted: false,
  videoMuted: false,
  handRaised: false
};

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
    body: options.body && typeof options.body !== "string" ? JSON.stringify(options.body) : options.body
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function saveSession({ token, user }) {
  if (token) {
    authToken = token;
    localStorage.setItem("eworkAuthToken", token);
  }
  if (user) {
    currentUser = user;
    localStorage.setItem("eworkUser", JSON.stringify(user));
  }
}

function setStatus(selector, message, type = "") {
  const el = document.querySelector(selector);
  if (!el) return;
  el.textContent = message;
  el.classList.remove("success", "error");
  if (type) el.classList.add(type);
}

function valueFor(selector) {
  return document.querySelector(selector)?.value.trim() || "";
}

function collectRegistrationPayload() {
  return {
    fullName: valueFor('[data-register="fullName"]'),
    email: valueFor('[data-register="email"]'),
    phone: valueFor('[data-register="phone"]'),
    country: valueFor('[data-register="country"]'),
    password: valueFor('[data-register="password"]'),
    profile: {
      field: valueFor('[data-register="field"]'),
      experienceLevel: valueFor('[data-register="experienceLevel"]'),
      careerGoal: valueFor('[data-register="careerGoal"]'),
      learningStyle: valueFor('[data-register="learningStyle"]')
    }
  };
}

function selectedCourseId() {
  return document.querySelector('input[name="path"]:checked')?.value || "level-1-foundation";
}

function selectedPaymentMethod() {
  return document.querySelector('input[name="payment"]:checked')?.value || "pending";
}

function cardBranch([code, title, text]) {
  return `
    <article class="branch-card">
      <span>${code}</span>
      <strong>${title}</strong>
      <p>${text}</p>
    </article>
  `;
}

function renderStaticContent() {
  const preview = document.querySelector("[data-branch-preview]");
  const branchGrid = document.querySelector("[data-branch-grid]");
  const levelsWrap = document.querySelector("[data-course-levels]");
  const specialWrap = document.querySelector("[data-special-courses]");
  const processWrap = document.querySelector("[data-process]");
  const pricingWrap = document.querySelector("[data-pricing]");
  const courseTable = document.querySelector("[data-course-table]");
  const stepper = document.querySelector("[data-stepper]");

  if (preview) {
    preview.innerHTML = branches.slice(0, 6).map(cardBranch).join("");
  }

  if (branchGrid) {
    branchGrid.innerHTML = branches.map(cardBranch).join("");
  }

  if (levelsWrap) {
    levelsWrap.innerHTML = levels
      .map(
        (level) => `
          <article class="course-card">
            <div class="course-meta">
              <span>${level.duration}</span>
              <span>${level.certificate}</span>
            </div>
            <h2>${level.title}</h2>
            <ul>${level.modules.map((module) => `<li>${module}</li>`).join("")}</ul>
            <a class="secondary-button" href="#register" data-route="register" data-enroll="${level.id}">Enroll</a>
          </article>
        `
      )
      .join("");
  }

  if (specialWrap) {
    specialWrap.innerHTML = specialCourses
      .map(
        (title) => `
          <article>
            <strong>${title}</strong>
            <p>Focused training with role-specific examples, practical tools, and a portfolio project.</p>
          </article>
        `
      )
      .join("");
  }

  if (processWrap) {
    processWrap.innerHTML = processSteps
      .map(([title, text]) => `<article><strong>${title}</strong><p>${text}</p></article>`)
      .join("");
  }

  if (pricingWrap) {
    pricingWrap.innerHTML = pricing
      .map(
        ([name, price, description, features], index) => `
          <article class="price-card ${index === 1 ? "featured" : ""}">
            <h2>${name}</h2>
            <div class="price">${price}</div>
            <p>${description}</p>
            <div class="price-meta">
              ${features.map((feature) => `<span>${feature}</span>`).join("")}
            </div>
          </article>
        `
      )
      .join("");
  }

  if (courseTable) {
    courseTable.innerHTML = levels
      .map(
        (level) => `
          <div class="course-row">
            <strong>${level.title}</strong>
            <span>${level.duration}</span>
            <span>${level.certificate}</span>
            <span>Prerequisites: ${level.title.includes("Level 1") ? "None" : "Previous level or placement pass"}</span>
            <a class="secondary-button" href="#register" data-route="register" data-enroll="${level.id}">Enroll</a>
          </div>
        `
      )
      .join("");
  }

  if (stepper) {
    stepper.innerHTML = [
      "Register account",
      "Learning profile",
      "Placement assessment",
      "Choose course path",
      "Payment",
      "Access portal"
    ]
      .map((label, index) => `<button type="button" data-step="${index + 1}">${index + 1}. ${label}</button>`)
      .join("");
  }

  const platformList = document.createElement("section");
  platformList.className = "section";
  platformList.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">API-style integrations</p>
      <h2>Designed for a scalable training platform</h2>
    </div>
    <div class="special-grid">
      ${apiStack.map((item) => `<article><strong>${item}</strong><p>Ready to connect with modern backend, payment, analytics, and notification services.</p></article>`).join("")}
    </div>
  `;

  const pricingPage = document.querySelector('[data-page="pricing"]');
  if (pricingPage && !pricingPage.querySelector(".special-grid")) {
    pricingPage.appendChild(platformList);
  }
}

function setRoute(route) {
  const target = document.querySelector(`[data-page="${route}"]`) ? route : "home";
  document.querySelectorAll("[data-page]").forEach((page) => {
    page.classList.toggle("active", page.dataset.page === target);
  });
  document.querySelectorAll("[data-route]").forEach((link) => {
    link.classList.toggle("active", link.dataset.route === target);
  });
  document.body.classList.remove("nav-open");
  document.querySelector(".menu-toggle")?.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "auto" });
}

function updateRegistrationStep(step) {
  currentStep = Math.min(6, Math.max(1, step));
  document.querySelectorAll("[data-form-step]").forEach((panel) => {
    panel.classList.toggle("active", Number(panel.dataset.formStep) === currentStep);
  });
  document.querySelectorAll("[data-step]").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.step) === currentStep);
  });
  const prev = document.querySelector("[data-prev-step]");
  const next = document.querySelector("[data-next-step]");
  if (prev) prev.disabled = currentStep === 1;
  if (next) next.textContent = currentStep === 6 ? "Finish" : "Next";
}

async function runPlacementAssessment() {
  const payload = collectRegistrationPayload();
  const score =
    payload.profile.experienceLevel === "Advanced" ? 86 : payload.profile.experienceLevel === "Intermediate" ? 62 : 28;

  if (!authToken) {
    const recommended = score > 75 ? "Advanced" : score > 40 ? "Intermediate" : "Beginner";
    setStatus("[data-register-status]", `Preview recommendation: ${recommended}. Create your account to save it.`, "success");
    updateRegistrationStep(4);
    return;
  }

  try {
    const data = await apiRequest("/assessments/placement", {
      method: "POST",
      body: { score, profile: payload.profile }
    });
    const courseId = data.assessment.recommendation.recommendedCourseId;
    const radio = document.querySelector(`input[name="path"][value="${courseId}"]`);
    if (radio) radio.checked = true;
    setStatus(
      "[data-register-status]",
      `Assessment saved. Recommended path: ${data.assessment.recommendation.recommendedLevel}.`,
      "success"
    );
    updateRegistrationStep(4);
  } catch (error) {
    setStatus("[data-register-status]", error.message, "error");
  }
}

async function submitRegistrationAndEnrollment() {
  const payload = collectRegistrationPayload();
  if (!payload.fullName || !payload.email || !payload.password) {
    setStatus("[data-register-status]", "Please complete your name, email, and password.", "error");
    updateRegistrationStep(1);
    return false;
  }

  try {
    setStatus("[data-register-status]", "Creating account and enrollment...");
    if (!authToken) {
      const auth = await apiRequest("/auth/register", { method: "POST", body: payload });
      saveSession(auth);
    }

    await apiRequest("/enrollments", {
      method: "POST",
      body: {
        courseId: selectedCourseId(),
        paymentMethod: selectedPaymentMethod(),
        installmentPlan: selectedPaymentMethod() === "bank_transfer"
      }
    });

    setStatus("[data-register-status]", "Account ready. Opening your dashboard.", "success");
    await refreshDashboard();
    return true;
  } catch (error) {
    setStatus("[data-register-status]", error.message, "error");
    return false;
  }
}

async function loginUser() {
  try {
    setStatus("[data-login-status]", "Signing in...");
    const auth = await apiRequest("/auth/login", {
      method: "POST",
      body: {
        email: valueFor('[data-login="email"]'),
        password: valueFor('[data-login="password"]')
      }
    });
    saveSession(auth);
    setStatus("[data-login-status]", "Login successful.", "success");
    await refreshDashboard();
    history.pushState(null, "", "#portal");
    setRoute("portal");
  } catch (error) {
    setStatus("[data-login-status]", error.message, "error");
  }
}

async function refreshDashboard() {
  if (!authToken) return;
  try {
    const data = await apiRequest("/me/dashboard");
    const dashboardTitle = document.querySelector('[data-portal-view="dashboard"] h1');
    if (dashboardTitle) {
      const firstName = data.user.fullName?.split(" ")[0] || "Learner";
      const progress = data.progress[0]?.percentComplete ?? 0;
      dashboardTitle.textContent = `Hi ${firstName}, your learning path is ${progress}% complete.`;
    }
    const mentorCard = document.querySelector('[data-portal-view="dashboard"] .dashboard-grid article:nth-child(3) strong');
    if (mentorCard) mentorCard.textContent = data.assignedMentor;
    const paymentCard = document.querySelector('[data-portal-view="dashboard"] .dashboard-grid article:nth-child(4) strong');
    if (paymentCard) paymentCard.textContent = data.paymentStatus;
  } catch {
    localStorage.removeItem("eworkAuthToken");
    localStorage.removeItem("eworkUser");
    authToken = "";
    currentUser = null;
  }
}

async function createBackendMeeting(title) {
  if (!authToken) return null;
  const data = await apiRequest("/meetings", {
    method: "POST",
    body: { title }
  });
  return data.meeting;
}

function slugifyRoomName(value) {
  const clean = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const random = Math.random().toString(36).slice(2, 8);
  return `ework-ai-${clean || "class"}-${random}`;
}

function extractRoomFromLink(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    if (parsed.hash.includes("online-classes")) {
      return new URLSearchParams(parsed.hash.split("?")[1] || "").get("room") || "";
    }
    return parsed.pathname.split("/").filter(Boolean).pop() || "";
  } catch {
    return trimmed.replace(/^#?online-classes\??room=/, "");
  }
}

function openMeeting(roomName) {
  const safeRoom = encodeURIComponent(roomName);
  const frame = document.querySelector("[data-meeting-frame]");
  const placeholder = document.querySelector("[data-classroom-placeholder]");
  const toolbar = document.querySelector("[data-class-toolbar]");
  const quickMessage = document.querySelector("[data-quick-message]");
  if (!frame || !placeholder || !roomName) return;
  frame.innerHTML = "";
  if (meetingApi) {
    meetingApi.dispose();
    meetingApi = null;
  }
  if (window.JitsiMeetExternalAPI) {
    meetingApi = new window.JitsiMeetExternalAPI("meet.jit.si", {
      roomName: safeRoom,
      parentNode: frame,
      width: "100%",
      height: "100%",
      configOverwrite: {
        prejoinPageEnabled: true
      },
      userInfo: {
        displayName: "eWORK AI Learner"
      }
    });
    meetingApi.addListener("readyToClose", endMeeting);
  } else {
    const iframe = document.createElement("iframe");
    iframe.title = "eWORK AI online class video call";
    iframe.allow = "camera; microphone; fullscreen; display-capture; clipboard-write";
    iframe.src = `https://meet.jit.si/${safeRoom}#config.prejoinPageEnabled=true&userInfo.displayName="eWORK AI Learner"`;
    frame.appendChild(iframe);
  }
  callState = { audioMuted: false, videoMuted: false, handRaised: false };
  updateCallButtons();
  frame.hidden = false;
  if (toolbar) toolbar.hidden = false;
  if (quickMessage) quickMessage.hidden = false;
  placeholder.hidden = true;
}

function buildShareLink(roomName) {
  const url = new URL(window.location.href);
  url.hash = `online-classes?room=${encodeURIComponent(roomName)}`;
  return url.toString();
}

function endMeeting() {
  const frame = document.querySelector("[data-meeting-frame]");
  const placeholder = document.querySelector("[data-classroom-placeholder]");
  const toolbar = document.querySelector("[data-class-toolbar]");
  const quickMessage = document.querySelector("[data-quick-message]");
  if (meetingApi) {
    meetingApi.dispose();
    meetingApi = null;
  }
  if (frame) {
    frame.innerHTML = "";
    frame.hidden = true;
  }
  if (placeholder) placeholder.hidden = false;
  if (toolbar) toolbar.hidden = true;
  if (quickMessage) quickMessage.hidden = true;
}

function updateCallButtons() {
  const audio = document.querySelector('[data-call-control="audio"]');
  const video = document.querySelector('[data-call-control="video"]');
  const hand = document.querySelector('[data-call-control="hand"]');
  if (audio) {
    audio.textContent = callState.audioMuted ? "Unmute mic" : "Mute mic";
    audio.setAttribute("aria-pressed", String(callState.audioMuted));
  }
  if (video) {
    video.textContent = callState.videoMuted ? "Turn camera on" : "Turn camera off";
    video.setAttribute("aria-pressed", String(callState.videoMuted));
  }
  if (hand) {
    hand.textContent = callState.handRaised ? "Lower hand" : "Raise hand";
    hand.setAttribute("aria-pressed", String(callState.handRaised));
  }
}

function executeMeetingCommand(command, value) {
  if (meetingApi) meetingApi.executeCommand(command, value);
}

function bindEvents() {
  document.addEventListener("click", async (event) => {
    const routeLink = event.target.closest("[data-route]");
    if (routeLink) {
      event.preventDefault();
      const route = routeLink.dataset.route;
      history.pushState(null, "", `#${route}`);
      setRoute(route);
      if (routeLink.hasAttribute("data-start-test")) updateRegistrationStep(3);
      if (route === "portal") refreshDashboard();
      if (routeLink.dataset.enroll) {
        const radio = document.querySelector(`input[name="path"][value="${routeLink.dataset.enroll}"]`);
        if (radio) radio.checked = true;
        updateRegistrationStep(4);
      }
    }

    const portalTab = event.target.closest("[data-portal-tab]");
    if (portalTab) {
      const tab = portalTab.dataset.portalTab;
      document.querySelectorAll("[data-portal-tab]").forEach((button) => {
        button.classList.toggle("active", button.dataset.portalTab === tab);
      });
      document.querySelectorAll("[data-portal-view]").forEach((view) => {
        view.classList.toggle("active", view.dataset.portalView === tab);
      });
    }

    const stepButton = event.target.closest("[data-step]");
    if (stepButton) updateRegistrationStep(Number(stepButton.dataset.step));

    if (event.target.closest("[data-next-step]")) {
      if (currentStep === 6) {
        const ok = await submitRegistrationAndEnrollment();
        if (ok) {
          history.pushState(null, "", "#portal");
          setRoute("portal");
        }
      } else {
        updateRegistrationStep(currentStep + 1);
      }
    }

    if (event.target.closest("[data-prev-step]")) updateRegistrationStep(currentStep - 1);

    if (event.target.closest("[data-placement-test]")) {
      await runPlacementAssessment();
    }

    if (event.target.closest("[data-login-submit]")) {
      await loginUser();
    }

    const provider = event.target.closest("[data-provider]");
    if (provider) {
      setStatus(
        "[data-register-status]",
        `${provider.dataset.provider} sign-up needs OAuth credentials from that provider. Email registration works now.`,
        "error"
      );
    }

    if (event.target.closest("[data-generate-meeting]")) {
      const title = document.querySelector("[data-class-title]")?.value || "";
      let room = slugifyRoomName(title);
      try {
        const backendMeeting = await createBackendMeeting(title || "eWORK AI Class");
        if (backendMeeting?.roomName) room = backendMeeting.roomName;
      } catch {
        // Keep local meeting generation available if the API is offline.
      }
      const shareLink = buildShareLink(room);
      const linkInput = document.querySelector("[data-meeting-link]");
      const box = document.querySelector("[data-generated-box]");
      const status = document.querySelector("[data-copy-status]");
      if (linkInput) linkInput.value = shareLink;
      if (box) box.hidden = false;
      if (status) status.textContent = "Meeting created. Share this link with learners.";
      history.replaceState(null, "", `#online-classes?room=${encodeURIComponent(room)}`);
      openMeeting(room);
    }

    if (event.target.closest("[data-join-meeting]")) {
      const value = document.querySelector("[data-join-link]")?.value || "";
      const room = extractRoomFromLink(value);
      if (room) {
        history.replaceState(null, "", `#online-classes?room=${encodeURIComponent(room)}`);
        openMeeting(room);
      }
    }

    if (event.target.closest("[data-copy-meeting]")) {
      const input = document.querySelector("[data-meeting-link]");
      const status = document.querySelector("[data-copy-status]");
      if (input?.value) {
        input.select();
        if (navigator.clipboard) {
          navigator.clipboard.writeText(input.value).catch(() => document.execCommand("copy"));
        } else {
          document.execCommand("copy");
        }
        if (status) status.textContent = "Copied. Send it by WhatsApp, email, chat, or SMS.";
      }
    }

    const control = event.target.closest("[data-call-control]");
    if (control) {
      const action = control.dataset.callControl;
      if (action === "audio") {
        callState.audioMuted = !callState.audioMuted;
        executeMeetingCommand("toggleAudio");
      }
      if (action === "video") {
        callState.videoMuted = !callState.videoMuted;
        executeMeetingCommand("toggleVideo");
      }
      if (action === "hand") {
        callState.handRaised = !callState.handRaised;
        executeMeetingCommand("toggleRaiseHand");
      }
      if (action === "chat") executeMeetingCommand("toggleChat");
      if (action === "hangup") {
        executeMeetingCommand("hangup");
        endMeeting();
      }
      updateCallButtons();
    }

    const certificateAction = event.target.closest("[data-certificate-action]");
    if (certificateAction) {
      const action = certificateAction.dataset.certificateAction;
      if (action === "download") {
        setStatus("[data-certificate-status]", "Certificate PDF generation is the next backend step.", "error");
      }
      if (action === "verify") {
        setStatus("[data-certificate-status]", "Verification works once a certificate has been issued from the API.", "success");
      }
      if (action === "linkedin") {
        window.open("https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME", "_blank", "noopener");
      }
    }

    if (event.target.closest("[data-callback-submit]")) {
      const form = event.target.closest("form");
      const fields = form ? [...form.querySelectorAll("input, textarea")].map((input) => input.value.trim()) : [];
      try {
        if (authToken) {
          await apiRequest("/messages", {
            method: "POST",
            body: {
              audience: "support",
              channel: "callback",
              body: `Callback request: ${fields.filter(Boolean).join(" | ")}`
            }
          });
        }
        setStatus("[data-callback-status]", "Callback request saved. Support will follow up.", "success");
      } catch (error) {
        setStatus("[data-callback-status]", error.message, "error");
      }
    }
  });

  document.querySelector("[data-quick-message]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector("[data-chat-message]");
    const message = input?.value.trim();
    if (!message) return;
    executeMeetingCommand("sendChatMessage", message);
    executeMeetingCommand("toggleChat");
    input.value = "";
  });

  document.querySelector(".menu-toggle")?.addEventListener("click", () => {
    const open = !document.body.classList.contains("nav-open");
    document.body.classList.toggle("nav-open", open);
    document.querySelector(".menu-toggle")?.setAttribute("aria-expanded", String(open));
  });

  window.addEventListener("popstate", () => {
    const [route, queryString] = (location.hash.replace("#", "") || "home").split("?");
    setRoute(route);
    const room = new URLSearchParams(queryString || "").get("room");
    if (route === "online-classes" && room) openMeeting(room);
  });
}

renderStaticContent();
bindEvents();
updateRegistrationStep(1);
const [initialRoute, queryString] = (location.hash.replace("#", "") || "home").split("?");
setRoute(initialRoute);
const initialRoom = new URLSearchParams(queryString || "").get("room");
if (initialRoute === "online-classes" && initialRoom) {
  const joinInput = document.querySelector("[data-join-link]");
  if (joinInput) joinInput.value = buildShareLink(initialRoom);
  openMeeting(initialRoom);
}
