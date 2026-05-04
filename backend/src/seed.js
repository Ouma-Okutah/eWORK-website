export const seedCourses = [
  {
    id: "level-1-foundation",
    title: "Level 1: Beginner Foundation",
    level: "Level 1",
    duration: "8 weeks",
    prerequisites: "None",
    certificateType: "Foundation certificate",
    price: 149,
    modules: [
      "AI basics",
      "Data basics",
      "Python basics",
      "Introduction to prompt engineering",
      "AI tools overview"
    ],
    projects: ["AI tool comparison report", "Beginner prompt portfolio"]
  },
  {
    id: "level-2-applied-skills",
    title: "Level 2: Intermediate Applied Skills",
    level: "Level 2",
    duration: "10 weeks",
    prerequisites: "Level 1 or placement pass",
    certificateType: "Applied skills certificate",
    price: 299,
    modules: [
      "Supervised and unsupervised learning",
      "Model training",
      "Data preprocessing",
      "API integration",
      "Practical AI projects"
    ],
    projects: ["Prediction model lab", "AI API integration project"]
  },
  {
    id: "level-3-professional",
    title: "Level 3: Advanced Professional Specialization",
    level: "Level 3",
    duration: "12 weeks",
    prerequisites: "Level 2 or advanced placement pass",
    certificateType: "Professional certificate",
    price: 499,
    modules: [
      "Model deployment",
      "AI product building",
      "MLOps",
      "AI architecture",
      "Fine-tuning and automation",
      "Real-world capstone"
    ],
    projects: ["Production deployment", "Professional AI capstone"]
  },
  {
    id: "ai-agents-automation",
    title: "AI Agents and Automation",
    level: "Special",
    duration: "4 weeks",
    prerequisites: "Basic AI tool knowledge",
    certificateType: "Special course certificate",
    price: 99,
    modules: ["Agent workflows", "Tool calling", "Automation design", "Monitoring"],
    projects: ["Business workflow agent"]
  },
  {
    id: "ai-for-healthcare",
    title: "AI for Healthcare",
    level: "Special",
    duration: "6 weeks",
    prerequisites: "Healthcare or data background recommended",
    certificateType: "Special course certificate",
    price: 129,
    modules: ["Clinical AI use cases", "Healthcare data", "Responsible AI", "Workflow automation"],
    projects: ["Healthcare AI workflow proposal"]
  }
];

export const seedBranches = [
  "Machine Learning",
  "Deep Learning",
  "Generative AI",
  "Natural Language Processing",
  "Computer Vision",
  "AI for Business",
  "AI for Data Science",
  "AI Automation / Agents",
  "MLOps",
  "Robotics / Intelligent Systems",
  "Reinforcement Learning",
  "Ethical AI / Responsible AI"
];
