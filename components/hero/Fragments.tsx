/**
 * Decorative interface fragments floating around the hero character.
 * Purely illustrative (aria-hidden) — generic labels, no real product,
 * client or tool screenshots.
 */
import { CheckIcon } from "../icons";

const card =
  "rounded-2xl border border-line bg-surface/80 shadow-[var(--shadow)] backdrop-blur-md";

export function ChecklistFragment({ large = false }: { large?: boolean }) {
  const rows = ["Requirement understood", "Scenarios tested", "Issue reproduced", "Fix verified", "UAT signed off"];
  return (
    <div className={`${card} ${large ? "w-[min(20rem,78vw)] p-5" : "w-56 p-4"}`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted">Release checklist</span>
        <span className="rounded-full bg-pass/15 px-2 py-0.5 font-mono text-[10px] text-pass">passing</span>
      </div>
      <ul className={`mt-3 space-y-2 ${large ? "text-[14px]" : "text-[12.5px]"}`}>
        {rows.map((r, i) => (
          <li key={r} className="flex items-center gap-2.5">
            <span
              className="tick grid h-4 w-4 shrink-0 place-items-center rounded-full bg-pass text-bg"
              style={{ ["--i" as string]: i }}
            >
              <CheckIcon className="h-2.5 w-2.5" />
            </span>
            <span className="text-text/90">{r}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ApiFragment() {
  return (
    <div className={`${card} w-60 overflow-hidden font-mono text-[11px] leading-relaxed`}>
      <div className="flex items-center justify-between border-b border-line px-3.5 py-2">
        <span>
          <span className="text-accent-text">GET</span> <span className="text-muted">/cart/items</span>
        </span>
        <span className="rounded bg-pass/15 px-1.5 text-pass">200</span>
      </div>
      <pre className="px-3.5 py-2.5 text-muted">
        {`{
  "sku": "A-102",
  "qty": 2,
  "discount": `}
        <span className="text-pass">&quot;product-specific&quot;</span>
        {`
}`}
      </pre>
    </div>
  );
}

export function TaskFragment() {
  return (
    <div className={`${card} w-52 p-3.5`}>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-flag" />
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted">UAT · in review</span>
      </div>
      <p className="mt-2 text-[13px] font-medium leading-snug">Verify checkout fix with client</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {["bg-accent", "bg-pass", "bg-flag"].map((c) => (
            <span key={c} className={`h-5 w-5 rounded-full border-2 border-surface ${c}`} />
          ))}
        </div>
        <span className="font-mono text-[10.5px] text-faint">QA ↔ Dev ↔ Client</span>
      </div>
    </div>
  );
}

export function LifecycleFragment() {
  const states = [
    { s: "Open", c: "text-danger" },
    { s: "Fixed", c: "text-flag" },
    { s: "Verified", c: "text-pass" },
  ];
  return (
    <div className={`${card} flex items-center gap-2 rounded-full px-3.5 py-2 font-mono text-[11px]`}>
      {states.map((x, i) => (
        <span key={x.s} className="flex items-center gap-2">
          <span className={x.c}>{x.s}</span>
          {i < states.length - 1 && <span className="text-faint">→</span>}
        </span>
      ))}
    </div>
  );
}
