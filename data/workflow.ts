/** "How I Work" — the QA + PM loop, shown as an interactive stepper. */
export type WorkflowStep = {
  id: string;
  title: string;
  side: "QA" | "PM" | "QA + PM";
  summary: string;
  /** What this step actually involves day to day. */
  actions: string[];
  /** What the step produces — shown as the "output" chip. */
  output: string;
};

export const workflow: WorkflowStep[] = [
  {
    id: "understand",
    title: "Understand",
    side: "QA + PM",
    summary: "Clarify the requirement and the expected behaviour before anything is tested or built.",
    actions: ["Read the requirement end to end", "Ask what 'done' looks like", "Note edge cases and open questions"],
    output: "Clear expected behaviour",
  },
  {
    id: "test",
    title: "Test",
    side: "QA",
    summary: "Exercise the feature across realistic scenarios — UI, workflow and API.",
    actions: ["Design test cases and scenarios", "Functional, regression, UI and API checks", "Positive, negative and boundary input"],
    output: "Test results",
  },
  {
    id: "reproduce",
    title: "Reproduce",
    side: "QA",
    summary: "Turn a symptom into a reliable set of steps anyone on the team can follow.",
    actions: ["Isolate the exact conditions", "Confirm it happens consistently", "Capture steps, data and evidence"],
    output: "Reproducible bug report",
  },
  {
    id: "investigate",
    title: "Investigate",
    side: "QA",
    summary: "Understand what is actually happening — not only what looks wrong.",
    actions: ["Compare expected vs actual", "Check API responses in DevTools and Postman", "Narrow down the likely cause"],
    output: "Likely cause",
  },
  {
    id: "coordinate",
    title: "Coordinate",
    side: "PM",
    summary: "Move the work forward with developers, PMs, clients and stakeholders.",
    actions: ["Track tasks and blockers in ClickUp", "Align developers on the fix", "Keep stakeholders updated"],
    output: "Unblocked, owned task",
  },
  {
    id: "verify",
    title: "Verify",
    side: "QA",
    summary: "Validate the fix against the original requirement, and check nothing nearby broke.",
    actions: ["Retest the original scenario", "Run focused regression", "Close only when behaviour matches"],
    output: "Verified fix",
  },
  {
    id: "deliver",
    title: "Deliver",
    side: "QA + PM",
    summary: "Support UAT with the client and confirm behaviour in production after release.",
    actions: ["Coordinate UAT", "Follow up on feedback", "Production verification"],
    output: "Reliable release",
  },
];
