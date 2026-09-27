/**
 * ───────────────────────────────────────────────────────────────
 *  FEATURED WORK — real projects you've worked on (as QA / PM + QA).
 *
 *  These are products you TESTED and COORDINATED, not products you built.
 *
 *  To update a product, edit its entry below. Nothing else needs changing.
 *
 *  ▸ url         Exact public URL. Leave "" until you have it — the
 *                "Visit Website" button only appears for real https:// URLs.
 *  ▸ screenshot  Put the image in public/images/work/ (1600×1000, WebP),
 *                e.g. "/images/work/store-home.webp". Leave "" to show an
 *                illustrative placeholder (clearly not a real screenshot).
 *  ▸ logo        public/images/work/<name>-logo.svg (or .png). "" → initials.
 *  ▸ metric      ONLY a number you can publish and verify (e.g. a public
 *                ranking). Never revenue, traffic or anything confidential.
 *                Leave null to show the safe `status` wording instead.
 *
 *  Only name products you're allowed to name publicly.
 * ───────────────────────────────────────────────────────────────
 */
export type ProductVisual = "commerce-b2b" | "commerce-b2c" | "cloud";

export type Product = {
  id: string;
  /** Product / website name. TODO markers below show what still needs your input. */
  name: string;
  /** One line: what the product actually does. */
  description: string;
  /** Safe descriptor shown when there is no published metric. */
  status: string;
  metric: { value: string; label: string; source?: string } | null;
  url: string;
  screenshot: string;
  screenshotAlt: string;
  logo: string;
  role: string;
  /** Short context line, e.g. "Hazesoft client project". */
  context: string;
  workedOn: string[];
  tools?: string[];
  /** Used for the illustrative preview when no screenshot is set. */
  visual: ProductVisual;
};

export const products: Product[] = [
  {
    id: "Sailracing",
    name: "Sailracing",
    description:
      "Sailracing is a Swedish apparel brand founded in 1977 and re-launched in 1999 that specializes in innovative, high-technical gear, outerwear, and sportswear for high-speed sailing and extreme weather conditions. They supply elite racing teams in major competitions like SailGP and the America's Cup.",
    status: "Production e-commerce platform",
    metric: null,
    url: "https://sailracing.com/se/en",
    screenshot: "/images/work/sailracing.jpg",
    screenshotAlt: "Sailracing online store homepage",
    logo: "/images/work/sailracing-icon.svg",
    role: "QA / PM + QA", // TODO: confirm your role on this product
    context: "Hazesoft client project",
    workedOn: ["Catalog & pricing rules" /* TODO: confirm per product */, "Cart & checkout", "Regression", "API testing", "UAT", "Production verification"],
    tools: ["Postman", "Chrome DevTools", "ClickUp"],
    visual: "commerce-b2b",
  },
  {
    id: "Dogman",
    name: "Dogman",
    description:
      "Dogman AB is the leading pet products brand and company in Sweden, firmly holding the top position in the market.",
    status: "Customer-facing e-commerce platform",
    metric: null,
    url: "https://dogman.se",
    screenshot: "/images/work/dogman.jpg",
    screenshotAlt: "Dogman online store homepage",
    logo: "/images/work/dogman-icon.png",
    role: "QA", // TODO: confirm your role on this product
    context: "Hazesoft client project",
    workedOn: ["Product pages (PLP / PDP)", "Wishlist", "Checkout", "Payment gateway flows", "Functional", "E2E"],
    tools: ["Chrome DevTools", "Postman"],
    visual: "commerce-b2c",
  },
  {
    id: "celestio",
    name: "Celestio",
    description:
      "A single control plane for your WordPress site: SFTP, database, domains, SSL and backup in one console. Plus the server-level controls other Swedish hosts keep behind a support ticket.",
    status: "Cloud platform · API testing",
    metric: null,
    url: "https://celestiocloud.com/",
    screenshot: "/images/work/celestio.jpg",
    screenshotAlt: "Celestio managed WordPress hosting homepage",
    logo: "/images/work/celestio-icon.png",
    role: "QA · API testing",
    context: "Hazesoft client project",
    workedOn: ["REST APIs", "Authentication", "Authorization", "Permissions", "Error handling", "Negative testing"],
    tools: ["Postman", "JSON"],
    visual: "cloud",
  },
];

/** A URL is only linked when it is a real https URL (placeholders never go live). */
export const isPublishableUrl = (url: string) => /^https:\/\/[^\s]+\.[^\s]+/.test(url) && !/example\.(com|org)/.test(url);
