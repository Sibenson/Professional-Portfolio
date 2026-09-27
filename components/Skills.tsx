import { learning, skillGroups } from "@/data/skills";
import SectionHeading from "./ui/SectionHeading";

export default function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-heading" className="relative border-t border-line py-24 md:py-36">
      <div className="container-x">
        <SectionHeading
          layout="split"
          id="skills"
          index="07"
          eyebrow="Skills"
          title={
            <>
              What I use <em>at work</em>
            </>
          }
          intro="Professional skills I use in my role today — and, kept separate, what I'm currently learning."
        />

        <div className="mt-14 grid gap-px overflow-hidden rounded-[32px] border border-line bg-line md:mt-20 lg:grid-cols-3">
          {skillGroups.map((g, i) => (
            <div key={g.name} className="reveal bg-bg p-6 sm:p-8" style={{ ["--d" as string]: i }}>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[1.6rem] font-semibold tracking-[-0.03em]">{g.name}</h3>
                <span className="font-mono text-[12px] text-faint">{String(g.skills.length).padStart(2, "0")}</span>
              </div>
              <p className="mt-1 text-[14px] text-muted">{g.blurb}</p>
              <ul className="mt-6 flex flex-wrap gap-1.5">
                {g.skills.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-line px-3 py-1.5 text-[13.5px] transition-colors duration-300 hover:border-line-strong hover:bg-surface-2"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Learning — visually distinct so it never reads as professional experience */}
        <div className="reveal mt-6 grid gap-6 rounded-[32px] border border-dashed border-flag/50 bg-flag/[0.04] p-6 sm:p-8 md:grid-cols-[16rem_1fr] md:items-center">
          <div>
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-flag">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-flag" />
              In progress
            </p>
            <h3 className="mt-2 text-[1.6rem] font-semibold tracking-[-0.03em]">Currently learning</h3>
            <p className="mt-1 text-[14px] text-muted">Personal learning — not part of my professional experience yet.</p>
          </div>
          <ul className="flex flex-wrap gap-2">
            {learning.map((s) => (
              <li key={s} className="rounded-full border border-dashed border-flag/50 px-3.5 py-1.5 text-[14px]">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
