"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Exposes how far the viewport has travelled through this element as a
 * CSS variable (--progress, 0 → 1). Children use it for rails / fills.
 * With reduced motion it is simply set to 1.
 */
export default function ScrollProgress({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--progress", "1");
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the top reaches 80% of the viewport, 1 when the bottom reaches 60%.
      const p = (vh * 0.8 - r.top) / (r.height + vh * 0.2);
      el.style.setProperty("--progress", String(Math.min(1, Math.max(0, p))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
