"use client";

import { useRef, useState } from "react";
import { workflow } from "@/data/workflow";
import SectionHeading from "./ui/SectionHeading";
import { ArrowRight, CheckIcon } from "./icons";

const sideStyle = {
  QA: "text-accent-text border-accent/40",
  PM: "text-pass border-pass/40",
  "QA + PM": "text-text border-line-strong",
} as const;

/** "How I work" — an interactive stepper (ARIA tabs with arrow-key navigation). */
export default function Workflow() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const step = workflow[active];

  const focusTab = (i: number) => {
    const next = (i + workflow.length) % workflow.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowDown: active + 1,
      ArrowLeft: active - 1,
      ArrowUp: active - 1,
      Home: 0,
      End: workflow.length - 1,
    };
    if (e.key in keys) {
      e.preventDefault();
      focusTab(keys[e.key]);
    }
  };

  return (
    <section id="approach" aria-labelledby="approach-heading" className="relative border-t border-line bg-bg-2 py-24 md:py-36">
      <div className="container-x">
        <SectionHeading
          id="approach"
          index="04"
          eyebrow="How I work"
          title={
            <>
              Not only &ldquo;I find bugs&rdquo; — I <em>follow</em> them through
            </>
          }
          intro="The same loop shows up whether I'm testing a feature or coordinating a release. Select a step to see what it involves."
        />

        <div className="reveal mt-14 overflow-hidden rounded-[32px] border border-line bg-surface md:mt-20">
          {/* Step rail */}
          <div
            role="tablist"
            aria-label="QA workflow steps"
            onKeyDown={onKeyDown}
            className="no-scrollbar relative flex overflow-x-auto border-b border-line"
          >
            {workflow.map((s, i) => {
              const selected = i === active;
              const done = i < active;
              return (
                <button
                  key={s.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  role="tab"
                  id={`tab-${s.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${s.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={`group relative flex min-w-[8.5rem] flex-1 flex-col items-start gap-3 px-5 py-5 text-left transition-colors duration-300 focus-visible:-outline-offset-2 ${
                    selected ? "bg-bg-2" : "hover:bg-bg-2/50"
                  }`}
                >
                  <span className="flex w-full items-center gap-2">
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] transition-colors duration-300 ${
                        selected
                          ? "border-accent bg-accent text-accent-ink"
                          : done
                            ? "border-pass/60 bg-pass/15 text-pass"
                            : "border-line-strong text-muted"
                      }`}
                    >
                      {done ? <CheckIcon className="h-3 w-3" /> : <span className="font-mono">{i + 1}</span>}
                    </span>
                    <span aria-hidden className={`h-px flex-1 ${done || selected ? "bg-accent/50" : "bg-line"}`} />
                  </span>
                  <span className={`text-[15px] font-medium ${selected ? "text-text" : "text-muted group-hover:text-text"}`}>{s.title}</span>
                  <span
                    aria-hidden
                    className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent transition-transform duration-500 ease-out-soft ${
                      selected ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Panel */}
          <div
            role="tabpanel"
            id={`panel-${step.id}`}
            aria-labelledby={`tab-${step.id}`}
            tabIndex={0}
            className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:p-14"
          >
            <div key={step.id} className="animate-[panel-in_500ms_var(--ease-out-soft)_both]">
              <div className="flex items-center gap-4">
                <span className="serif-accent text-6xl leading-none text-accent-text md:text-7xl">
                  {String(active + 1).padStart(2, "0")}
                </span>
                <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] ${sideStyle[step.side]}`}>{step.side}</span>
              </div>
              <h3 className="display mt-6 text-[clamp(2.5rem,5vw,4rem)]">{step.title}</h3>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">{step.summary}</p>
            </div>

            <div key={`${step.id}-a`} className="flex animate-[panel-in_500ms_var(--ease-out-soft)_80ms_both] flex-col justify-between gap-8">
              <ul className="space-y-3">
                {step.actions.map((a) => (
                  <li key={a} className="flex items-start gap-3 rounded-2xl border border-line bg-bg/40 px-4 py-3.5 text-[15px]">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-pass" />
                    {a}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="flex items-center gap-3 text-[15px]">
                  <span className="eyebrow">Output</span>
                  <span className="rounded-full bg-text px-3 py-1 text-[13px] font-medium text-bg">{step.output}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setActive((active + 1) % workflow.length)}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-4 text-[14px] transition-colors hover:border-text"
                >
                  {active === workflow.length - 1 ? "Start over" : `Next: ${workflow[active + 1].title}`}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
