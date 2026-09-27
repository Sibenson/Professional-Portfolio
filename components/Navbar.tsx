"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { navItems, site } from "@/data/site";
import ThemeToggle from "./ThemeToggle";
import { ArrowUpRight, CloseIcon, MenuIcon } from "./icons";

const ids = navItems.map((n) => n.href.slice(1));

export default function Navbar({ hasResume }: { hasResume: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const listRef = useRef<HTMLUListElement>(null);
  const [marker, setMarker] = useState<{ left: number; width: number } | null>(null);

  // Background appears once the page scrolls; active = last nav section above 40% of the viewport.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 12);
      const line = window.innerHeight * 0.4;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      // At the very bottom, the last section is active even if it's short.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = ids[ids.length - 1];
      setActive(current);
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

  // Sliding marker under the active desktop link.
  useLayoutEffect(() => {
    const measure = () => {
      const link = listRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
      if (link) setMarker({ left: link.offsetLeft, width: link.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  // Escape closes the mobile menu; lock page scroll while it's open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4">
      <nav
        aria-label="Primary"
        className={`container-x flex items-center justify-between transition-[padding] duration-500 ease-out-soft`}
      >
        <div
          className={`flex w-full items-center justify-between rounded-full border py-1.5 pl-2 pr-1.5 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-out-soft ${
            scrolled || open
              ? "border-line bg-bg/75 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl"
              : "border-transparent bg-transparent"
          }`}
        >
          <a href="#home" className="flex items-center gap-2.5 rounded-full pr-3" onClick={() => setOpen(false)}>
            <span className="relative grid h-9 w-9 place-items-center rounded-full bg-text text-[13px] font-bold tracking-tight text-bg">
              SG
              <span aria-hidden className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg bg-accent" />
            </span>
            <span className="hidden text-[15px] font-semibold tracking-tight sm:inline">{site.name}</span>
          </a>

          <ul ref={listRef} className="relative hidden items-center md:flex">
            {marker && (
              <span
                aria-hidden
                className="absolute top-1/2 h-9 -translate-y-1/2 rounded-full bg-surface-2 transition-[left,width] duration-500 ease-out-soft"
                style={{ left: marker.left, width: marker.width }}
              />
            )}
            {navItems.map((item) => {
              const id = item.href.slice(1);
              const isActive = active === id;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    data-id={id}
                    aria-current={isActive ? "location" : undefined}
                    className={`relative z-10 block rounded-full px-4 py-2 text-[14px] transition-colors duration-300 ${
                      isActive ? "text-text" : "text-muted hover:text-text"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            {hasResume && (
              <a
                href={site.resumePath}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden h-10 items-center gap-1.5 rounded-full bg-text px-4 text-[14px] font-medium text-bg transition-colors hover:bg-accent hover:text-accent-ink sm:inline-flex"
              >
                Resume <ArrowUpRight className="h-3.5 w-3.5" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full text-text transition-colors hover:bg-surface-2 md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu — always mounted so it can animate; inert while closed */}
      <div
        id="mobile-menu"
        inert={!open}
        className={`fixed inset-x-0 bottom-0 top-[4.75rem] -z-10 bg-bg/95 backdrop-blur-xl transition-[opacity,visibility] duration-300 md:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <ul className="container-x flex flex-col pt-6">
          {navItems.map((item, i) => {
            const id = item.href.slice(1);
            return (
              <li
                key={item.href}
                className={`border-b border-line transition-[opacity,transform] duration-500 ease-out-soft ${
                  open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
                style={{ transitionDelay: open ? `${i * 50 + 60}ms` : "0ms" }}
              >
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active === id ? "location" : undefined}
                  className="flex min-h-16 items-center justify-between text-3xl font-semibold tracking-tight"
                >
                  <span className={active === id ? "text-text" : "text-muted"}>{item.label}</span>
                  <span className="font-mono text-xs text-faint">0{i + 1}</span>
                </a>
              </li>
            );
          })}
          {hasResume && (
            <li className="pt-8">
              <a
                href={site.resumePath}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center justify-center rounded-full bg-text font-medium text-bg"
              >
                Resume
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}
