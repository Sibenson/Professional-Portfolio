/** Professional skills (used at work) vs. current learning. Source: CV. */
export type SkillGroup = { name: string; blurb: string; skills: string[] };

export const skillGroups: SkillGroup[] = [
  {
    name: "Quality Assurance",
    blurb: "Day-to-day testing work",
    skills: [
      "Manual Testing",
      "Functional Testing",
      "Regression Testing",
      "Exploratory Testing",
      "UI / Frontend Testing",
      "End-to-End Testing",
      "API Testing",
      "Test Case Design",
      "Test Scenario Design",
      "Bug Reporting",
      "Issue Reproduction",
      "Issue Investigation",
      "UAT Verification",
      "Production Verification",
    ],
  },
  {
    name: "Project Coordination",
    blurb: "Moving work to delivery",
    skills: [
      "ClickUp",
      "Task Planning",
      "Requirement Clarification",
      "Developer Coordination",
      "Client Communication",
      "UAT Coordination",
      "Blocker Tracking",
      "Fix Coordination",
      "Delivery Follow-up",
    ],
  },
  {
    name: "Tools",
    blurb: "What I use at work",
    skills: ["Postman", "REST APIs", "JSON", "Chrome DevTools", "ClickUp", "Slack", "Microsoft Teams", "Git", "GitLab"],
  },
];

/** Learning areas — NOT part of current professional work. */
export const learning = ["Playwright", "JavaScript", "TypeScript", "Newman", "API Automation", "CI/CD"];
