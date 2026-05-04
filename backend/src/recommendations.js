const fieldToCourse = {
  healthcare: "ai-for-healthcare",
  education: "level-1-foundation",
  teacher: "level-1-foundation",
  developer: "level-2-applied-skills",
  software: "level-2-applied-skills",
  business: "ai-agents-automation",
  marketing: "ai-agents-automation",
  finance: "level-2-applied-skills"
};

export function recommendPath(profile = {}, score = 0) {
  const field = `${profile.field || profile.industry || ""}`.toLowerCase();
  const level =
    score < 40 || profile.experienceLevel === "Beginner"
      ? "Level 1"
      : score < 75 || profile.experienceLevel === "Intermediate"
        ? "Level 2"
        : "Level 3";

  const matchedField = Object.keys(fieldToCourse).find((keyword) => field.includes(keyword));
  const specialCourseId = matchedField ? fieldToCourse[matchedField] : null;

  return {
    recommendedLevel: level,
    recommendedCourseId:
      specialCourseId ||
      (level === "Level 1"
        ? "level-1-foundation"
        : level === "Level 2"
          ? "level-2-applied-skills"
          : "level-3-professional"),
    reason: "Recommendation based on field, experience level, career goal, and placement score."
  };
}
