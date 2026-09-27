import { company, roles } from "@/data/experience";
import SectionHeading from "./ui/SectionHeading";
import ScrollProgress from "./ui/ScrollProgress";

/**
 * Career progression, oldest → newest. Growth is shown by the layout itself:
 * each role gets a wider column and a larger title than the one before.
 */
const titleSize = ["text-[2.1rem] lg:text-[2.4rem]", "text-[2.4rem] lg:text-[2.9rem]", "text-[2.8rem] lg:text-[3.8rem]"];

export default function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-heading" className="relative border-t border-line bg-bg-2 py-24 md:py-36">
      <div className="container-x">
        <SectionHeading
          id="experience"
          index="02"
          eyebrow={`${company.name} · ${company.location}`}
          title={
            <>
              From testing features to <em>coordinating</em> delivery
            </>
          }
          intro="Three roles at one company, each adding responsibility — and QA stayed hands-on the whole way through."
        />

        <ScrollProgress className="relative mt-16 md:mt-24">
          {/* Rails: vertical on mobile, horizontal on desktop */}
          <div aria-hidden className="absolute bottom-0 left-[11px] top-2 w-px bg-line-strong lg:hidden">
            <div className="rail-fill absolute inset-0 bg-accent" />
          </div>
          <div aria-hidden className="absolute left-0 right-0 top-[11px] hidden h-px bg-line-strong lg:block">
            <div className="rail-fill rail-fill-x absolute inset-0 bg-accent" />
          </div>

          <ol className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr_1.45fr] lg:gap-10">
            {roles.map((role, i) => (
              <li key={role.title} className="reveal relative pl-12 lg:pl-0 lg:pt-14" style={{ ["--d" as string]: i }}>
                <span
                  aria-hidden
                  className={`absolute left-0 top-1 grid h-[23px] w-[23px] place-items-center rounded-full border lg:top-0 ${
                    role.current ? "border-accent bg-bg" : "border-line-strong bg-bg-2"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${role.current ? "pulse-dot bg-accent" : "bg-muted"}`} />
                </span>

                <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-muted">
                  <time dateTime={role.startISO}>{role.start}</time>
                  <span className="mx-2 text-faint">—</span>
                  <span className={role.current ? "text-accent-text" : ""}>{role.end}</span>
                </p>
                <h3 className={`display mt-3 ${titleSize[i] ?? titleSize[2]} ${role.current ? "" : "text-text/90"}`}>
                  {role.current ? (
                    <>
                      PM <em className="text-accent-text">+</em> QA
                    </>
                  ) : (
                    role.title
                  )}
                </h3>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">{role.summary}</p>

                <ul
                  className={`mt-6 grid gap-x-6 gap-y-2 text-[14px] ${
                    role.current ? "rounded-2xl border border-line-strong bg-surface p-5 sm:grid-cols-2" : ""
                  }`}
                >
                  {role.focus.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <span aria-hidden className={`mt-[8px] h-1 w-1 shrink-0 rounded-full ${role.current ? "bg-accent" : "bg-faint"}`} />
                      <span className={role.current ? "text-text" : "text-text/80"}>{f}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </ScrollProgress>
      </div>
    </section>
  );
}
