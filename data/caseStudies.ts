/**
 * ───────────────────────────────────────────────────────────────
 *  QA investigations — real issues from your work, anonymized.
 *
 *  Never include client names, URLs, credentials, customer data,
 *  production data or internal details.
 *
 *  `visual` picks the small illustrative diagram shown with the story.
 * ───────────────────────────────────────────────────────────────
 */
export type CaseStep = { label: string; detail: string };

export type CaseStudy = {
  id: string;
  title: string;
  context: string;
  summary: string;
  steps: CaseStep[];
  tags: string[];
  visual: "cart-rule" | "role-permission" | "pdp-variant";
  /** Where the story ends up — shown on the final step. */
  outcome: string;
};

export const caseStudies: CaseStudy[] = [
  {
    id: "cart-pricing-rule",
    title: "A product discount that leaked across the cart",
    context: "E-commerce · Production",
    summary:
      "A catalog/cart pricing rule meant for specific products was also discounting other products in the same cart.",
    steps: [
      { label: "Requirement", detail: "The discount should apply only to the specific products the rule targets." },
      { label: "Test", detail: "Built carts mixing matching and non-matching products at different quantities." },
      { label: "Issue", detail: "Once a matching SKU reached quantity 2 or more, other products in the cart were discounted too." },
      {
        label: "Investigation",
        detail:
          "The old logic checked whether the cart contained a matching SKU with quantity ≥ 2 — then applied the discount to every product, not just the matching ones.",
      },
      { label: "Fix", detail: "Developers changed the logic to be product-specific, so the discount applies only to matching products." },
      { label: "Verification", detail: "Retested matching-only, non-matching-only and mixed carts in UAT, then verified in production." },
    ],
    tags: ["Pricing rules", "Cart", "UAT", "Production verification"],
    visual: "cart-rule",
    outcome: "Verified in UAT and production",
  },
  {
    id: "role-permission",
    title: "Admin couldn’t duplicate pages",
    context: "Web application · Roles & permissions",
    summary: "An admin account didn’t have the page-duplication permission — it had only ever been enabled for super-admin.",
    steps: [
      { label: "Requirement", detail: "Admin users need to be able to duplicate pages." },
      {
        label: "Investigation",
        detail:
          "Reproduced with an admin account and compared it with super-admin. Duplication was only enabled for the super-admin role.",
      },
      { label: "Permission configuration", detail: "Enabled the permission for the admin role through Configuration Menu → Role. No code change needed." },
      { label: "Verification", detail: "Confirmed the admin account could now duplicate pages successfully." },
    ],
    tags: ["Roles", "Permissions", "Configuration"],
    visual: "role-permission",
    outcome: "Admin can duplicate pages",
  },
  {
    id: "pdp-variant",
    title: "Parent product, child data, blank image",
    context: "E-commerce · Product pages",
    summary:
      "A parent product without an image opened from the listing page (PLP) into a product page (PDP) that mixed parent and child data.",
    steps: [
      { label: "Observe", detail: "Opening the parent product from the PLP led to a PDP with an incorrect, blank image state." },
      {
        label: "Investigate",
        detail:
          "The PDP displayed the child SKU and its price, while the image stayed associated with the parent product — which had no image.",
      },
      {
        label: "Price check",
        detail: "Also found a pricing/discount display discrepancy — verified the displayed total price against the price after discount.",
      },
      { label: "Report", detail: "Documented both behaviours with reproduction steps and shared them with the developers." },
    ],
    tags: ["PLP → PDP", "Variants", "Pricing display"],
    visual: "pdp-variant",
    outcome: "Reproduced and reported",
  },
];
