/**
 * ───────────────────────────────────────────────────────────────
 *  Personal details & links — edit here to update them site-wide.
 *  Source of truth: your CV. Keep this file in sync with it.
 * ───────────────────────────────────────────────────────────────
 */
export const site = {
  name: "Sibenson Gautam",
  firstName: "Sibenson",
  lastName: "Gautam",
  roleShort: "PM + QA",
  roleFocus: "Software Quality & Project Coordination",
  location: "Kathmandu, Nepal",
  company: "Hazesoft Pvt. Ltd.",

  /** Hero positioning statement — keep it to one or two sentences. */
  statement:
    "I bridge software quality and project delivery — testing products, investigating issues, coordinating teams, and helping turn requirements into reliable releases.",

  contact: {
    email: "sibensongautam@gmail.com",
    phoneDisplay: "+977 9862370433",
    phoneHref: "tel:+9779862370433",
    linkedin: "https://www.linkedin.com/in/sibenson-gautam-5630b4325",
    linkedinDisplay: "in/sibenson-gautam",
    /** Optional. Leave empty to hide GitHub everywhere. */
    github: "",
  },

  /**
   * Put your PDF at public/resume.pdf. The Resume buttons appear
   * automatically once the file exists, and stay hidden until then.
   */
  resumePath: "/resume.pdf",

  /**
   * 3D character for the hero.
   *  - model:  a .glb file (compress it first — see README "3D character").
   *  - poster: a still image of the character (WebP/PNG, transparent background).
   *            Shown while the model loads, on reduced-motion, and when WebGL is unavailable.
   * Both are optional. The hero detects which files exist at build time.
   */
  character: {
    model: "/models/character.glb",
    poster: "/models/character-poster.webp",
    posterAlt: "3D character illustration of Sibenson Gautam",
    /**
     * Built-in "little me", used when there is no .glb model.
     * Tweak the colours to look more like you. Set enabled: false to hide it.
     */
    builtIn: {
      enabled: true,
      greeting: "Hi, I'm Sibenson 👋",
    },
    /** Built-in character appearance — adjust to look like you (see README "Make it look like you"). */
    look: {
      skin: "#c98e66",
      hair: "#1c1512",
      jacket: "#2a2b31", // open overshirt / jacket
      shirt: "#efe9df", // tee underneath
      pants: "#3a4152", // chinos
      shoes: "#f4f1ea", // sneakers (accent sole)
      glasses: false,
      beard: "none" as "none" | "stubble",
      badge: "PM + QA", // lanyard ID
    },
  },
} as const;

export const navItems = [
  { label: "Home", href: "#home" },
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;
