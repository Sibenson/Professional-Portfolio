"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "../icons";

/**
 * Accessible, dependency-free carousel built on native scroll-snap:
 * touch swipe and trackpad scrolling come for free, buttons/dots/arrow
 * keys drive the same scroll position. Slides per view come from CSS
 * (1 on mobile, 2 from sm, 3 from xl), so there is no layout shift.
 */
export default function Carousel({ label, children }: { label: string; children: ReactNode }) {
  const track = useRef<HTMLUListElement>(null);
  const slides = Children.toArray(children);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  const metrics = useCallback(() => {
    const el = track.current;
    const first = el?.children[0] as HTMLElement | undefined;
    if (!el || !first) return null;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = first.offsetWidth + gap;
    const perView = Math.max(1, Math.round((el.clientWidth + gap) / step));
    return { el, step, total: Math.max(1, slides.length - perView + 1) };
  }, [slides.length]);

  const sync = useCallback(() => {
    const m = metrics();
    if (!m) return;
    const atEnd = m.el.scrollLeft >= m.el.scrollWidth - m.el.clientWidth - 2;
    setPages(m.total);
    setPage(atEnd ? m.total - 1 : Math.min(m.total - 1, Math.round(m.el.scrollLeft / m.step)));
  }, [metrics]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    sync();
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [sync]);

  const goTo = (i: number) => {
    const m = metrics();
    if (!m) return;
    const target = Math.max(0, Math.min(m.total - 1, i));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    m.el.scrollTo({ left: target * m.step, behavior: reduce ? "auto" : "smooth" });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(page + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(page - 1);
    }
  };

  const controlsNeeded = pages > 1;
  const btn =
    "grid h-12 w-12 place-items-center rounded-full border border-line-strong text-text transition-[background-color,border-color,color,opacity] duration-300 hover:border-accent hover:bg-accent hover:text-accent-ink hover:glow-gold disabled:pointer-events-none disabled:opacity-30";

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} onKeyDown={onKeyDown}>
      <ul
        ref={track}
        className="no-scrollbar -mx-[clamp(1rem,4vw,2.5rem)] flex snap-x snap-mandatory scroll-px-[clamp(1rem,4vw,2.5rem)] items-start gap-5 overflow-x-auto overscroll-x-contain px-[clamp(1rem,4vw,2.5rem)] pb-2 pt-1"
      >
        {slides.map((slide, i) => (
          <li
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            className="w-[86%] max-w-[26rem] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] sm:max-w-none xl:w-[calc((100%-2.5rem)/3)] xl:[&:nth-child(3n+2)]:mt-16 xl:[&:nth-child(3n+3)]:mt-8"
          >
            {slide}
          </li>
        ))}
      </ul>

      <div className={`mt-8 flex items-center justify-between gap-6 ${controlsNeeded ? "" : "xl:hidden"}`}>
        <div className="flex items-center gap-2" role="group" aria-label="Choose slide">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === page ? "true" : undefined}
              className="group/dot grid h-11 min-w-6 place-items-center"
            >
              <span
                className={`block h-1.5 rounded-full transition-[width,background-color] duration-500 ease-out-soft ${
                  i === page ? "w-8 bg-accent" : "w-1.5 bg-line-strong group-hover/dot:bg-muted"
                }`}
              />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <p aria-live="polite" className="mr-2 font-mono text-[12px] text-muted">
            {String(page + 1).padStart(2, "0")} / {String(pages).padStart(2, "0")}
          </p>
          <button type="button" className={btn} onClick={() => goTo(page - 1)} disabled={page === 0} aria-label="Previous slide">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button type="button" className={btn} onClick={() => goTo(page + 1)} disabled={page >= pages - 1} aria-label="Next slide">
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
