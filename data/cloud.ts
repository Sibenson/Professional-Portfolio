/**
 * Cloud platform & API testing. Source: CV.
 * Your role was QA / API testing — not building or operating infrastructure.
 */
export type CloudProject = {
  id: string;
  name: string;
  /** Keep ownership accurate: Kepler Hosting is a PARENT-COMPANY project, not a client project. */
  ownership: string;
  summary: string;
  areas: string[];
};

export const cloudProjects: CloudProject[] = [
  {
    id: "celestio",
    name: "Celestio",
    ownership: "Hazesoft client project",
    summary: "Cloud hosting platform QA and API testing — checking users can only do what their role allows.",
    areas: ["REST APIs", "Authentication", "Authorization", "Permissions", "Error handling"],
  },
  {
    id: "kepler",
    name: "Kepler Hosting",
    ownership: "Parent-company project",
    summary: "API-level testing of core cloud resources, focused on tenant isolation and invalid / boundary input.",
    areas: ["Tenant isolation", "Networks", "Security groups", "Block storage", "API / database validation"],
  },
];

/** Test design techniques used across both platforms. */
export const testTypes = [
  { name: "Positive", note: "Valid requests return the expected resource and status." },
  { name: "Negative", note: "Invalid, unauthorised or malformed requests fail safely." },
  { name: "Boundary", note: "Limits, empty values and edge-of-range input." },
  { name: "Error handling", note: "Clear status codes and messages — no leaked detail." },
];

export const apiToolkit = ["Postman", "REST APIs", "JSON", "Auth / AuthZ", "Tenant isolation", "Issue investigation"];
