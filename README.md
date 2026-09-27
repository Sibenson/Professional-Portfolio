# Sibenson Gautam — PM + QA | Software Quality & Project Coordination

Next.js 16 · TypeScript · Tailwind CSS 4 · optional 3D hero (three.js + React Three Fiber) · deployed on Vercel (free) · contact form via Resend (free).

All personal content lives in `data/` — you can update the site without touching components.

```
app/
  api/contact/route.ts   ← server-side email sending (secrets stay here)
  layout.tsx             ← SEO metadata, JSON-LD, fonts, theme
  page.tsx               ← section order; detects optional assets (resume, 3D model, poster)
  icon.svg · opengraph-image.tsx
components/
  Hero.tsx + hero/       ← hero, 3D stage, decorative QA fragments
  work/                  ← Featured Work: carousel, product card, placeholder preview
  Experience.tsx         ← animated career timeline
  About.tsx              ← approach, principles, metrics
  Workflow.tsx           ← interactive "How I work" stepper
  CaseStudies.tsx + cases/ ← QA investigations + illustrative diagrams
  CloudApi.tsx · Skills.tsx · Contact.tsx · Footer.tsx
  ui/                    ← SectionHeading, ButtonLink, RevealObserver, ScrollProgress
data/
  site.ts        ← name, statement, contact links, resume + 3D character paths
  products.ts    ← FEATURED WORK — the 3 products (name, URL, screenshot, logo, role…)
  experience.ts  ← roles + headline metrics
  workflow.ts    ← "How I work" steps
  caseStudies.ts ← QA investigations
  cloud.ts       ← Celestio / Kepler Hosting
  skills.ts · education.ts
public/
  images/work/   ← product screenshots + logos
  models/        ← character.glb + character-poster.webp
  resume.pdf     ← add yours here
```

## Things to add (the site works without them)

| What | Where | Effect |
|---|---|---|
| Real product names, URLs, descriptions, roles | `data/products.ts` (search for `TODO`) | "Visit Website →" appears only for real `https://` URLs |
| Product screenshots (1600×1000 WebP) | `public/images/work/` + `screenshot` field | Replaces the "Illustrative preview" wireframe |
| Product logos (SVG/PNG) | `public/images/work/` + `logo` field | Replaces the initials tile |
| Published metric (e.g. a public ranking) | `metric` field | Only numbers you can verify and publish |
| 3D character | `public/models/character.glb` | Hero shows the 3D character |
| Character still image | `public/models/character-poster.webp` | Shown while loading, on reduced-motion, and without WebGL |
| Resume | `public/resume.pdf` | Resume buttons appear |

## 3D character

1. Export your character as **.glb** (glTF binary). If it has an idle animation, it plays automatically; otherwise it gently floats and turns toward the pointer.
2. Compress it before adding it (aim for **under ~3 MB**):
   ```bash
   npx @gltf-transform/cli optimize input.glb public/models/character.glb \
     --compress meshopt --texture-compress webp --texture-size 1024
   ```
   Meshopt compression is supported out of the box. (Draco is not configured — use meshopt.)
3. Render a still of the character with a transparent background as `public/models/character-poster.webp` (~1200px tall). Strongly recommended — it's the fallback.
4. Rebuild. The model is normalised automatically (centred, sized to the stage). To adjust framing, change the numbers in `components/hero/CharacterCanvas.tsx` (`scale` line and `camera` position).

### Make it look like you

- **Quick (built-in character):** edit `character.look` in `data/site.ts` — skin, hair, jacket, tee, chinos, sneakers, `glasses`, `beard: "stubble"`, badge text. The character follows the cursor, blinks, and waves when the hero comes into view or on hover.
- **Real likeness (.glb):** create a 3D avatar from a photo (e.g. an image-to-3D or photo-to-avatar tool that exports GLB), rig it and add an **Idle** and a **Waving** animation (Mixamo works well; convert FBX → GLB in Blender), then compress and save it as `public/models/character.glb`. Name the clips so they contain "idle" and "wave" — the site plays idle on loop and the wave whenever the hero comes into view.

**Performance behaviour:** three.js is only downloaded when a model exists, after first paint, and only when WebGL is available and Save-Data is off. Rendering pauses when the hero is off-screen, pixel ratio is capped (lower on mobile), and any load error falls back to the poster/illustration. With `prefers-reduced-motion`, the poster is used if present; otherwise the model renders without animation.

---

## 1. Installation

Requires **Node.js 20.9 or newer**.

```bash
npm install
```

## 2. Local development

```bash
cp .env.example .env.local   # then fill in the values (see step 3)
npm run dev
```

Open http://localhost:3000. Run `npm run build` before deploying to catch errors.

## 3. Environment variables

| Variable | Required | What it is |
|---|---|---|
| `RESEND_API_KEY` | Yes | Your Resend API key. **Server-only** — never exposed to the browser. |
| `CONTACT_TO_EMAIL` | Yes | Your Gmail address — where messages arrive. |
| `CONTACT_FROM_EMAIL` | No | Sender name/address. Defaults to `Portfolio Contact <onboarding@resend.dev>`. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Your live URL, e.g. `https://sibenson.vercel.app`. Used for SEO and share previews. |

Never add `NEXT_PUBLIC_` to the Resend key — that prefix makes a variable visible in the browser.

## 4. Contact form setup (Resend, free)

**How it works:** Visitor → form → `/api/contact` (runs on Vercel) → Resend → your Gmail. The visitor never opens an email client, and your key never reaches the browser.

**Free-tier limits (checked September 2026):** 3,000 emails/month, capped at **100 emails/day**, 1 custom domain, no card required. When the cap is reached, sending pauses — you are not charged. That is plenty for a personal site.

**Setup:**

1. Sign up at https://resend.com **using the same Gmail address** that should receive messages.
2. Go to **API Keys → Create API Key**. Permission: *Sending access*. Copy the key (starts with `re_`).
3. Put the values in `.env.local` (local) and in Vercel (step 9):
   ```
   RESEND_API_KEY=re_...
   CONTACT_TO_EMAIL=sibensongautam@gmail.com
   ```
4. Run `npm run dev`, submit the form, and check your inbox (and Spam, the first time — mark it "Not spam").

**Why the same Gmail?** Without your own domain, Resend lets you send from `onboarding@resend.dev`, but only **to the email address on your Resend account**. For a contact form that's exactly what you need.

**Replying:** each email sets `Reply-To` to the visitor's address, so clicking **Reply** in Gmail writes straight to them. The email body shows From (visitor email), Name, Subject and Message.

**Optional — own domain:** if you buy a domain later, verify it in Resend → Domains, then set `CONTACT_FROM_EMAIL="Sibenson Gautam <contact@yourdomain.com>"`. This improves deliverability.

**Spam protection included:**
- Hidden honeypot field (bots fill it; submission is silently dropped)
- Time trap (submissions faster than 3 seconds are dropped)
- Same-origin check on the API route
- Validation of every field on both browser and server (required fields, email format, length limits)
- Rate limit: 5 submissions per IP per 15 minutes. This is in-memory, so it's best-effort on serverless (it resets on cold starts) — fine for a personal site, and it needs no paid database.
- Button is disabled while sending, preventing double submissions.

If emails don't arrive: check Vercel → your project → **Logs** for `[contact]` messages, and Resend → **Emails** for delivery status.

## 5. Featured Work (products)

Edit the three entries in `data/products.ts`. Add or remove entries freely — the carousel adapts (1 card per view on mobile, 2 on tablet, 3 on wide desktop). Only name products you're allowed to name publicly, and never publish confidential metrics. In `npm run dev`, cards show hints where a screenshot or URL is missing; in production they show a neutral "Illustrative preview" / "Link on request".

## 6. Updating content

All text lives in `data/`. Keep it consistent with your CV — don't add figures, clients or responsibilities that aren't on it. Case studies are in `data/caseStudies.ts`; leave out client names, URLs and any customer or production data.

## 7. Adding your resume

Save your PDF as **`public/resume.pdf`** and redeploy. The navbar **Resume** button and the **Download Resume** section appear automatically; until the file exists they stay hidden, so there are no broken links. To use a different filename, change `resumePath` in `data/site.ts`.

## 8. Contact details and GitHub

Email, phone, LinkedIn and location are set in `data/site.ts` under `contact`. They appear in the hero, contact section, footer and structured data.

GitHub is optional: set `contact.github` to your profile URL to show the icon, or leave it empty to hide it.

## 9. Deploying to Vercel (free)

1. Push this folder to a GitHub/GitLab repository.
2. Go to https://vercel.com/new, import the repository. Framework is detected as **Next.js** — keep the defaults.
3. Before deploying, open **Environment Variables** and add `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `NEXT_PUBLIC_SITE_URL` (use your `https://<project>.vercel.app` URL; you can update it later).
4. Click **Deploy**.
5. Test the live contact form once and confirm the email arrives.

After changing environment variables in Vercel, redeploy (Deployments → ⋯ → Redeploy) for them to take effect. Every push to your main branch redeploys automatically.
