"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/data/site";
import { ApiFragment, ChecklistFragment, LifecycleFragment, TaskFragment } from "./Fragments";

// three.js only loads on the client, after first paint, when the device can render it.
const CharacterCanvas = dynamic(() => import("./CharacterCanvas"), { ssr: false });

type Props = { hasModel: boolean; hasPoster: boolean };

function canUseWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The hero visual. Possible states, chosen on the client:
 *  1. 3D character — your .glb if present, otherwise the built-in "little me"
 *     (needs WebGL, not Save-Data). Waves whenever the hero comes into view.
 *  2. Poster image (poster present; also shown while the model loads)
 *  3. Illustrative composition (no WebGL / 3D disabled / load error)
 * The page never depends on WebGL.
 */
export default function HeroStage({ hasModel, hasPoster }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [use3D, setUse3D] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [compact, setCompact] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [waveKey, setWaveKey] = useState(0);
  const [waving, setWaving] = useState(false);
  const want3D = hasModel || site.character.builtIn.enabled;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    setCompact(window.matchMedia("(max-width: 767px)").matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);

    if (!want3D) return () => mq.removeEventListener("change", onChange);

    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const lowPower = conn?.saveData || (navigator.hardwareConcurrency ?? 8) <= 2;
    // With reduced motion and a poster available, the still image is the better experience.
    const skip = !canUseWebGL() || lowPower || (mq.matches && hasPoster);

    // Start after first paint so the model never competes with the page's own content.
    if (skip) setFallback(true);
    const timer = skip ? 0 : window.setTimeout(() => setUse3D(true), 500);
    return () => {
      mq.removeEventListener("change", onChange);
      clearTimeout(timer);
    };
  }, [want3D, hasPoster]);

  // Pause rendering off-screen; subtle parallax on the fragments.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    if (reduced) return () => io.disconnect();
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        el.style.setProperty("--px", String((e.clientX / window.innerWidth - 0.5) * 2));
        el.style.setProperty("--py", String((e.clientY / window.innerHeight - 0.5) * 2));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  const onWave = useCallback((w: boolean) => setWaving(w), []);

  // Wave hello every time the hero comes (back) into view once the character is ready.
  useEffect(() => {
    if (ready && inView) setWaveKey((k) => k + 1);
  }, [ready, inView]);

  const showCanvas = use3D && !failed;
  const hasCharacter = (want3D && !failed && !fallback) || hasPoster;
  const showPoster = hasPoster && !(showCanvas && ready);

  // Fragments drift slightly against the pointer: depth without distraction.
  const layer = (depth: number) => ({
    transform: `translate3d(calc(var(--px, 0) * ${depth}px), calc(var(--py, 0) * ${depth}px), 0)`,
  });

  return (
    <div
      ref={stageRef}
      className="relative mx-auto h-[25rem] w-full max-w-[40rem] sm:h-[30rem] lg:h-[min(44rem,78vh)]"
    >
      {/* Stage: halo + orbit rings + floor shadow */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[46%] aspect-square w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(229,184,66,0.06)_0%,rgba(10,10,12,0)_70%)]" />
        <svg viewBox="0 0 400 400" className="absolute left-1/2 top-[46%] w-[92%] -translate-x-1/2 -translate-y-1/2 text-line-strong">
          <circle cx="200" cy="200" r="198" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeDasharray="2 6" />
          <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeOpacity="0.35" />
          <circle cx="200" cy="2" r="3" className="fill-accent" />
        </svg>
        <div className="absolute bottom-[6%] left-1/2 h-8 w-[46%] -translate-x-1/2 rounded-[50%] bg-black/40 blur-2xl" />
      </div>

      {/* Character */}
      {hasCharacter && (
        <div className="absolute inset-0">
          {showPoster && (
            <Image
              src={site.character.poster}
              alt={site.character.posterAlt}
              fill
              priority
              sizes="(min-width: 1024px) 40rem, 90vw"
              className={`object-contain object-bottom transition-opacity duration-700 ${showCanvas && ready ? "opacity-0" : "opacity-100"}`}
            />
          )}
          {showCanvas && (
            <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
              <CharacterCanvas
                url={hasModel ? site.character.model : null}
                active={inView}
                reducedMotion={reduced}
                compact={compact}
                waveKey={waveKey}
                onReady={onReady}
                onError={onError}
                onWave={onWave}
              />
            </div>
          )}
          {/* Speech bubble while waving */}
          <p
            aria-hidden={!waving}
            className={`pointer-events-none absolute left-[57%] top-[9%] z-10 whitespace-nowrap rounded-2xl rounded-bl-sm border border-line-strong bg-surface px-4 py-2 text-[14px] font-medium shadow-[var(--shadow)] transition-[opacity,transform] duration-500 ease-out-soft sm:top-[11%] ${
              waving ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"
            }`}
          >
            {site.character.builtIn.greeting}
          </p>
          {!hasPoster && showCanvas && !ready && (
            <div className="absolute inset-0 grid place-items-center" role="status">
              <span className="font-mono text-xs text-muted">Loading character…</span>
            </div>
          )}
        </div>
      )}

      {/* Interface fragments */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {hasCharacter ? (
          <>
            {/* Kept to the edges so the character's face and wave stay clear */}
            <div className="absolute left-0 top-[4%] hidden md:block" style={layer(12)}>
              <div className="float origin-top-left scale-90" style={{ ["--d" as string]: 1 }}>
                <ApiFragment />
              </div>
            </div>
            <div className="absolute left-0 top-[62%] hidden sm:block" style={layer(-10)}>
              <div className="float origin-left scale-90" style={{ ["--d" as string]: 0 }}>
                <ChecklistFragment />
              </div>
            </div>
            <div className="absolute bottom-[12%] right-0 hidden sm:block" style={layer(8)}>
              <div className="float origin-bottom-right scale-90" style={{ ["--d" as string]: 2 }}>
                <TaskFragment />
              </div>
            </div>
            <div className="absolute bottom-[3%] left-[2%]" style={layer(-6)}>
              <LifecycleFragment />
            </div>
          </>
        ) : (
          <>
            <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2">
              <div style={layer(-6)}>
                <ChecklistFragment large />
              </div>
            </div>
            <div className="absolute right-0 top-[4%] hidden sm:block" style={layer(14)}>
              <div className="float" style={{ ["--d" as string]: 1 }}>
                <ApiFragment />
              </div>
            </div>
            <div className="absolute bottom-[4%] left-0 hidden sm:block" style={layer(10)}>
              <div className="float" style={{ ["--d" as string]: 2 }}>
                <TaskFragment />
              </div>
            </div>
            <div className="absolute bottom-[6%] right-[4%] sm:bottom-[12%]" style={layer(-8)}>
              <LifecycleFragment />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
