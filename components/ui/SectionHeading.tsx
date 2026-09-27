import type { ReactNode } from "react";

type Props = {
  id: string;
  /** Chapter number, e.g. "02". */
  index: string;
  eyebrow: string;
  /** Title; wrap a word in <em> for the serif accent. */
  title: ReactNode;
  intro?: ReactNode;
  /** Optional element aligned to the right on desktop (e.g. carousel controls). */
  aside?: ReactNode;
  className?: string;
  /** "split": title left, intro right (desktop). Varies rhythm between sections. */
  layout?: "stacked" | "split";
};

/** Editorial section heading: chapter index + eyebrow, large title, short intro. */
export default function SectionHeading({ id, index, eyebrow, title, intro, aside, className = "", layout = "stacked" }: Props) {
  if (layout === "split") {
    return (
      <header className={`reveal grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-end lg:gap-16 ${className}`}>
        <div>
          <p className="eyebrow flex items-center gap-3">
            <span className="text-accent-text">{index}</span>
            <span aria-hidden className="h-px w-8 bg-line-strong" />
            {eyebrow}
          </p>
          <h2
            id={`${id}-heading`}
            className="display mt-5 text-balance text-[clamp(2.4rem,6vw,5rem)] text-text [&_em]:text-accent-text"
          >
            {title}
          </h2>
        </div>
        {intro && <p className="max-w-md text-lg leading-relaxed text-muted lg:justify-self-end lg:pb-2">{intro}</p>}
        {aside}
      </header>
    );
  }
  return (
    <header className={`reveal grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end ${className}`}>
      <div className="max-w-4xl">
        <p className="eyebrow flex items-center gap-3">
          <span className="text-accent-text">{index}</span>
          <span aria-hidden className="h-px w-8 bg-line-strong" />
          {eyebrow}
        </p>
        <h2
          id={`${id}-heading`}
          className="display mt-5 text-balance text-[clamp(2.4rem,6vw,5rem)] text-text [&_em]:text-accent-text"
        >
          {title}
        </h2>
        {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">{intro}</p>}
      </div>
      {aside}
    </header>
  );
}
