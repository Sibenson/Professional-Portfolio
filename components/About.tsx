import { metrics } from "@/data/experience";
import { courses, education } from "@/data/education";
import SectionHeading from "./ui/SectionHeading";

const principles = [
  { title: "Hands-on QA", body: "I still test every day — functional, regression, UI, workflow and API." },
  { title: "Product first", body: "I learn what a feature is for before I decide how to test it." },
  { title: "Investigation", body: "I reproduce, compare expected vs actual, and narrow down the cause." },
  { title: "Clear communication", body: "Bug reports and updates that developers and clients can act on." },
  { title: "Coordination", body: "Requirements, blockers, fixes and UAT — tracked until they're done." },
  { title: "Always learning", body: "Currently building automation skills with Playwright and TypeScript." },
];

export default function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="relative border-t border-line py-24 md:py-36">
      <div className="container-x">
        <SectionHeading
          id="about"
          index="03"
          eyebrow="About"
          title={
            <>
              A tester who also <em>moves</em> the work
            </>
          }
        />

        <div className="mt-14 grid gap-14 lg:mt-20 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <div className="reveal space-y-6 text-lg leading-relaxed text-muted md:text-[1.2rem]">
            <p className="text-[1.4rem] leading-snug text-text md:text-[1.75rem] md:leading-[1.3]">
              I started at Hazesoft as a QA Trainee and grew into a hybrid PM + QA role. Testing is still at the centre
              of what I do — I&apos;ve added the work of getting it delivered.
            </p>
            <p>
              Before testing anything, I want to know what the feature is supposed to do and what &ldquo;done&rdquo;
              looks like. Then I test against that — realistic scenarios, not only the happy path.
            </p>
            <p>
              When something breaks, reporting the symptom is half the job. I reproduce it, check the API responses
              behind the interface, and narrow it down so developers start from a likely cause rather than a
              screenshot.
            </p>
            <p>
              As PM + QA I also keep delivery moving: tasks and blockers in ClickUp, requirements clarified with
              clients, fixes coordinated with developers, UAT run with stakeholders — and every fix verified before
              it&apos;s called done.
            </p>
          </div>

          <ul className="grid content-start gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
            {principles.map((p, i) => (
              <li key={p.title} className="reveal bg-bg p-6" style={{ ["--d" as string]: i % 2 }}>
                <p className="font-mono text-[11px] text-faint">0{i + 1}</p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Metrics band */}
        <dl className="reveal mt-20 grid grid-cols-2 gap-y-10 border-y border-line py-10 md:mt-28 lg:grid-cols-5">
          {metrics.map((m) => (
            <div key={m.label} className="flex flex-col-reverse gap-2 pr-4">
              <dt className="max-w-[13rem] text-[14px] leading-snug text-muted">{m.label}</dt>
              <dd className="display text-[clamp(2.6rem,6vw,4.5rem)]">
                {m.value}
                {m.unit && <span className="ml-1.5 text-[0.35em] font-medium tracking-normal text-muted">{m.unit}</span>}
              </dd>
            </div>
          ))}
          <div className="col-span-2 flex flex-col-reverse gap-2 lg:col-span-1">
            <dt className="text-[14px] leading-snug text-muted">Career progression</dt>
            <dd className="text-[clamp(1.6rem,3vw,2.1rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              QA <span className="serif-accent text-accent-text">→</span> PM + QA
            </dd>
          </div>
        </dl>
        <p className="mt-3 font-mono text-[11px] text-faint">Figures are approximate.</p>

        <div className="reveal mt-12 flex flex-wrap gap-x-10 gap-y-3 text-[15px]">
          {education.map((e) => (
            <p key={e.title}>
              <span className="eyebrow mr-3">Education</span>
              <span className="font-medium">{e.title}</span>
              <span className="text-muted"> · {e.org} · {e.period}</span>
            </p>
          ))}
          {courses.map((c) => (
            <p key={c.org}>
              <span className="eyebrow mr-3">Course</span>
              <span className="font-medium">{c.org}</span>
              <span className="text-muted"> · {c.title}</span>
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
