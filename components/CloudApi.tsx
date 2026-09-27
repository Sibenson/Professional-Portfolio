import { apiToolkit, cloudProjects, testTypes } from "@/data/cloud";
import SectionHeading from "./ui/SectionHeading";

/** Illustrative only — generic endpoints showing the kinds of checks, not a real API. */
const matrix = [
  { m: "POST", path: "/networks", c: "valid payload", s: 201, t: "Positive" },
  { m: "POST", path: "/networks", c: "missing required field", s: 400, t: "Negative" },
  { m: "GET", path: "/volumes/:id", c: "no auth token", s: 401, t: "Authentication" },
  { m: "DELETE", path: "/security-groups/:id", c: "role lacks permission", s: 403, t: "Authorization" },
  { m: "GET", path: "/volumes/:id", c: "another tenant's resource", s: 404, t: "Tenant isolation" },
  { m: "POST", path: "/volumes", c: "size at / beyond limit", s: 400, t: "Boundary" },
];

const statusColor = (s: number) => (s < 300 ? "text-pass bg-pass/12" : s < 500 ? "text-flag bg-flag/12" : "text-danger bg-danger/12");

export default function CloudApi() {
  return (
    <section id="cloud" aria-labelledby="cloud-heading" className="grain relative overflow-hidden border-t border-line bg-bg-2 py-24 md:py-36">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,#000_30%,#000_70%,transparent)]" />
      <div className="container-x relative">
        <SectionHeading
          layout="split"
          id="cloud"
          index="06"
          eyebrow="Cloud platform & API testing"
          title={
            <>
              Testing what sits <em>behind</em> the interface
            </>
          }
          intro="QA and API-level testing for cloud platforms in Postman — access control, tenant isolation and resource workflows. My role was testing, not building or operating the infrastructure."
        />

        <div className="mt-14 grid gap-6 md:mt-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
          <div className="grid gap-6">
            {cloudProjects.map((p, i) => (
              <article key={p.id} aria-labelledby={`cloud-${p.id}`} className="reveal rounded-[28px] border border-line bg-surface p-6 sm:p-8" style={{ ["--d" as string]: i }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 id={`cloud-${p.id}`} className="text-[2rem] font-semibold leading-none tracking-[-0.035em]">
                    {p.name}
                  </h3>
                  <span
                    className={`rounded-full border px-3 py-1 font-mono text-[11px] ${
                      p.id === "kepler" ? "border-accent/40 text-accent-text" : "border-line-strong text-muted"
                    }`}
                  >
                    {p.ownership}
                  </span>
                </div>
                <p className="mt-4 text-[15.5px] leading-relaxed text-muted">{p.summary}</p>
                <ul className="mt-6 flex flex-wrap gap-1.5">
                  {p.areas.map((a) => (
                    <li key={a} className="rounded-full bg-surface-2 px-3 py-1 text-[13px]">
                      {a}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
            <ul className="reveal grid grid-cols-2 gap-px overflow-hidden rounded-[28px] border border-line bg-line">
              {testTypes.map((t) => (
                <li key={t.name} className="bg-surface p-5">
                  <p className="font-medium">{t.name}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{t.note}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Illustrative test matrix */}
          <div className="reveal overflow-hidden rounded-[28px] border border-line bg-surface lg:sticky lg:top-28 lg:self-start" style={{ ["--d" as string]: 1 }}>
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <span className="flex items-center gap-2">
                <span aria-hidden className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
                  <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
                  <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
                </span>
                <span className="ml-2 font-mono text-[12px] text-muted">api-test-matrix</span>
              </span>
              <span className="font-mono text-[10.5px] text-faint">illustrative · not real endpoints</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left font-mono text-[12px]">
                <caption className="sr-only">Illustrative examples of API test cases by type</caption>
                <thead className="text-[10.5px] uppercase tracking-[0.08em] text-faint">
                  <tr className="border-b border-line">
                    <th scope="col" className="px-5 py-3 font-normal">Request</th>
                    <th scope="col" className="px-3 py-3 font-normal">Condition</th>
                    <th scope="col" className="px-3 py-3 font-normal">Expect</th>
                    <th scope="col" className="px-5 py-3 text-right font-normal">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((r, i) => (
                    <tr key={i} className="border-b border-line/70 transition-colors last:border-0 hover:bg-bg-2/70">
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <span className="text-accent-text">{r.m}</span> <span className="text-text">{r.path}</span>
                      </td>
                      <td className="px-3 py-3.5 text-muted">{r.c}</td>
                      <td className="px-3 py-3.5">
                        <span className={`rounded px-1.5 py-0.5 ${statusColor(r.s)}`}>{r.s}</span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right text-muted">{r.t}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-line bg-bg-2/60 px-5 py-4">
              <p className="font-mono text-[11px] text-faint">Also validated</p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
                {["Status codes", "JSON payloads", "Error messages", "Backend state via API / database"].map((x) => (
                  <li key={x} className="flex items-center gap-1.5">
                    <span aria-hidden className="h-1 w-1 rounded-full bg-accent" />
                    {x}
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-mono text-[11px] text-faint">
                Toolkit <span className="ml-2 text-muted">{apiToolkit.join(" · ")}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
