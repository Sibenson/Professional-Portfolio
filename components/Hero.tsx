import { site } from "@/data/site";
import { roles } from "@/data/experience";
import HeroStage from "./hero/HeroStage";
import ButtonLink from "./ui/ButtonLink";
import { ArrowRight, LinkedInIcon } from "./icons";

const story = ["Understand", "Test", "Investigate", "Coordinate", "Verify", "Deliver"];

export default function Hero({ hasModel, hasPoster }: { hasModel: boolean; hasPoster: boolean }) {
  return (
    <section id="home" aria-labelledby="hero-heading" className="grain relative overflow-hidden">
      <div aria-hidden className="bg-grid mask-fade pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-0 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_60%)]"
      />

      <div className="container-x relative grid items-center gap-6 pb-10 pt-28 sm:pt-32 lg:min-h-[100svh] lg:grid-cols-[1.05fr_0.95fr] lg:gap-4 lg:pb-16 lg:pt-28">
        <div className="relative z-10">
          <p className="reveal flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-muted">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 py-1 pl-2 pr-3 backdrop-blur">
              <span aria-hidden className="pulse-dot h-2 w-2 rounded-full bg-pass" />
              {site.roleShort} at {site.company}
            </span>
            <span>{site.location}</span>
          </p>

          <h1 id="hero-heading" className="display reveal mt-7 text-[clamp(3.5rem,12vw,9rem)]" style={{ ["--d" as string]: 1 }}>
            <span className="block">{site.firstName}</span>
            <span className="block text-muted/80">{site.lastName}</span>
          </h1>

          <div className="reveal mt-7 flex flex-wrap items-center gap-x-5 gap-y-3" style={{ ["--d" as string]: 2 }}>
            <p className="text-[clamp(1.75rem,3.6vw,2.6rem)] font-semibold leading-none tracking-[-0.03em]">
              PM <span className="serif-accent text-accent-text">+</span> QA
            </p>
            <span aria-hidden className="hidden h-8 w-px bg-line-strong sm:block" />
            <p className="max-w-[16rem] text-[15px] leading-snug text-muted">{site.roleFocus}</p>
          </div>

          <p className="reveal mt-8 max-w-xl text-lg leading-relaxed text-text/85 md:text-xl" style={{ ["--d" as string]: 3 }}>
            {site.statement}
          </p>

          <div className="reveal mt-9 flex flex-wrap items-center gap-3" style={{ ["--d" as string]: 4 }}>
            <ButtonLink href="#work">
              See products I&apos;ve worked on
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
            </ButtonLink>
            <ButtonLink href="#contact" variant="ghost">
              Get in touch
            </ButtonLink>
            <a
              href={site.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile (opens in a new tab)"
              className="grid h-12 w-12 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text"
            >
              <LinkedInIcon className="h-[18px] w-[18px]" />
            </a>
          </div>

          {/* Career teaser — the full timeline lives in #experience */}
          <ol aria-label="Career progression" className="reveal mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[12px]" style={{ ["--d" as string]: 5 }}>
            {roles.map((r, i) => (
              <li key={r.title} className="flex items-center gap-3">
                <span className={r.current ? "text-accent-text" : "text-muted"}>
                  {r.title}
                  <span className="ml-2 text-faint">{r.start.split(" ")[1]}</span>
                </span>
                {i < roles.length - 1 && <span aria-hidden className="text-faint">→</span>}
              </li>
            ))}
          </ol>
        </div>

        <div className="reveal relative" style={{ ["--d" as string]: 2 }}>
          <HeroStage hasModel={hasModel} hasPoster={hasPoster} />
        </div>
      </div>

      {/* The story the rest of the page tells */}
      <div className="relative border-y border-line bg-bg-2/60 backdrop-blur-sm">
        <ol aria-label="How I deliver" className="container-x no-scrollbar flex items-center gap-6 overflow-x-auto py-4 font-mono text-[12px] uppercase tracking-[0.12em] text-muted md:justify-between">
          {story.map((s, i) => (
            <li key={s} className="flex shrink-0 items-center gap-6">
              <span>
                <span className="mr-2 text-faint">0{i + 1}</span>
                <span className={i === story.length - 1 ? "text-accent-text" : "text-text/80"}>{s}</span>
              </span>
              {i < story.length - 1 && <span aria-hidden className="hidden h-px w-10 bg-line-strong sm:block lg:w-16" />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
