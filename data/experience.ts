/**
 * Career at Hazesoft Pvt. Ltd., oldest first. Source: CV.
 * Titles are exact — do not rename them.
 */
export type Role = {
  title: string;
  /** Short label used on the timeline rail. */
  start: string;
  end: string;
  /** ISO-ish dates for <time dateTime>. */
  startISO: string;
  summary: string;
  focus: string[];
  current?: boolean;
};

export const company = {
  name: "Hazesoft Pvt. Ltd.",
  location: "Kathmandu, Nepal",
};

export const roles: Role[] = [
  {
    title: "QA Trainee",
    start: "Apr 2025",
    end: "Jul 2025",
    startISO: "2025-04",
    summary: "Learned QA methodology on real features — executing test cases and verifying bugs with developers.",
    focus: [
      "Manual testing",
      "Test case execution",
      "Frontend testing",
      "API testing assistance",
      "Bug verification",
      "QA methodologies & process",
    ],
  },
  {
    title: "QA Associate",
    start: "Aug 2025",
    end: "Jun 2026",
    startISO: "2025-08",
    summary:
      "Owned day-to-day testing across web applications and e-commerce workflows — from the interface down to the APIs behind it.",
    focus: [
      "Functional & regression testing",
      "Frontend / UI testing",
      "Workflow & API testing",
      "Test case design & execution",
      "Bug reporting & tracking",
      "Issue reproduction",
      "Fix verification",
      "UAT support",
      "Production verification",
      "E-commerce workflows",
    ],
  },
  {
    title: "PM + QA",
    start: "Jul 2026",
    end: "Present",
    startISO: "2026-07",
    current: true,
    summary:
      "Coordinating project delivery in ClickUp with developers, clients and stakeholders — while staying hands-on with QA through development, UAT and production.",
    focus: [
      "Task coordination in ClickUp",
      "Requirement clarification",
      "Developer coordination",
      "Client & stakeholder communication",
      "UAT coordination",
      "Blocker & issue tracking",
      "Fix coordination",
      "Delivery follow-up",
      "Issue investigation & reproduction",
      "Functional, regression, UI, API, UAT & production verification",
    ],
  },
];

/**
 * Headline figures. Honest approximations — keep the ranges rather than rounding up.
 */
export const metrics = [
  { value: "1+", unit: "year", label: "Hands-on QA experience" },
  { value: "7–10", unit: "", label: "Applications & projects tested" },
  { value: "8–11", unit: "", label: "Frontend & backend developers coordinated with" },
  { value: "3–5", unit: "", label: "Production releases supported" },
];
