import { caseStudies, type CaseStudy } from "@/data/caseStudies";
import SectionHeading from "./ui/SectionHeading";
import { CartRuleVisual, PdpVariantVisual, RolePermissionVisual } from "./cases/CaseVisuals";

const visuals = {
  "cart-rule": CartRuleVisual,
  "role-permission": RolePermissionVisual,
  "pdp-variant": PdpVariantVisual,
} as const;

function Case({ study, index }: { study: CaseStudy; index: number }) {
  const Visual = visuals[study.visual];
  const headingId = `case-${study.id}`;
  const flip = index % 2 === 1;

  return (
    <article aria-labelledby={headingId} className="reveal grid grid-cols-1 gap-10 border-t border-line pt-12 lg:grid-cols-2 lg:gap-16 lg:pt-16">
      <div className={`min-w-0 ${flip ? "lg:order-2" : ""}`}>
        <div className="flex items-center gap-4">
          <span className="serif-accent text-5xl leading-none text-faint">{String(index + 1).padStart(2, "0")}</span>
          <span className="eyebrow">{study.context}</span>
        </div>
        <h3 id={headingId} className="mt-5 text-[clamp(1.9rem,3.6vw,2.9rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
          {study.title}
        </h3>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{study.summary}</p>

        {/* Trace: each step of the investigation */}
        <ol className="mt-8">
          {study.steps.map((step, i) => {
            const last = i === study.steps.length - 1;
            return (
              <li key={step.label} className="relative grid grid-cols-[1.75rem_1fr] gap-4 pb-5 last:pb-0">
                {!last && <span aria-hidden className="absolute bottom-0 left-[13px] top-7 w-px bg-line-strong" />}
                <span
                  aria-hidden
                  className={`relative z-10 mt-0.5 grid h-7 w-7 place-items-center rounded-full border font-mono text-[10.5px] ${
                    last ? "border-pass bg-pass text-bg" : "border-line-strong bg-bg text-muted"
                  }`}
                >
                  {i + 1}
                </span>
                <div>
                  <h4 className={`font-mono text-[12px] uppercase tracking-[0.1em] ${last ? "text-pass" : "text-text"}`}>{step.label}</h4>
                  <p className="mt-1 text-[15px] leading-relaxed text-muted">{step.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className={`flex min-w-0 flex-col gap-5 lg:sticky lg:top-28 lg:self-start ${flip ? "lg:order-1" : ""}`}>
        <div className="rounded-[28px] border border-line bg-surface p-3 sm:p-5">
          <div className="mb-4 flex items-center justify-between px-1">
            <span className="eyebrow !text-[10.5px]">Simplified illustration</span>
            <span className="flex items-center gap-2 rounded-full bg-pass/12 px-2.5 py-1 text-[12px] text-pass">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-pass" />
              {study.outcome}
            </span>
          </div>
          <Visual />
        </div>
        <ul className="flex flex-wrap gap-1.5" aria-label="Topics">
          {study.tags.map((t) => (
            <li key={t} className="rounded-full border border-line px-3 py-1 text-[13px] text-muted">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function CaseStudies() {
  if (caseStudies.length === 0) return null;
  return (
    <section id="investigations" aria-labelledby="investigations-heading" className="relative border-t border-line py-24 md:py-36">
      <div className="container-x">
        <SectionHeading
          layout="split"
          id="investigations"
          index="05"
          eyebrow="QA investigations"
          title={
            <>
              Finding out <em>why</em>, not only what
            </>
          }
          intro="Real issues I worked on, from requirement to verified behaviour. Client names, data and code are left out; diagrams are simplified."
        />
        <div className="mt-16 space-y-16 md:mt-24 md:space-y-24">
          {caseStudies.map((s, i) => (
            <Case key={s.id} study={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
