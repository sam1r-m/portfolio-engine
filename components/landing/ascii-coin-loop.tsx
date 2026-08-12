"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { fps, frames } from "@/lib/data/ascii-coin-frames.js";
import { cn } from "@/lib/utils";

/** >1 plays faster than the export’s nominal fps. */
const PLAYBACK_SPEED = 1.3;

const isNarrowViewport = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 1023px)").matches;

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function reducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function reducedMotionServerSnapshot() {
  return false;
}

/** Frames come out of ascii-mation; the wrapper scales them to fit the column. */
export function AsciiCoinLoop({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLAnchorElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [boxH, setBoxH] = useState(0);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    reducedMotionSnapshot,
    reducedMotionServerSnapshot,
  );

  const applyScale = useCallback(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    const pre = preRef.current;
    if (!wrap || !inner || !pre || !frames.length) return;

    const cs = getComputedStyle(wrap);
    const padX =
      parseFloat(cs.paddingLeft || "0") + parseFloat(cs.paddingRight || "0");
    const cw = wrap.clientWidth - padX;
    if (cw < 8) return;

    const pw = pre.offsetWidth;
    const ph = pre.offsetHeight;
    if (pw < 1 || ph < 1) return;

    const fit = cw / pw;
    const maxScale = isNarrowViewport() ? 1.35 : 2.4;
    const s = Math.min(fit, maxScale);
    inner.style.transform = `scale(${s})`;
    inner.style.transformOrigin = "top left";

    const nextH = Math.ceil(ph * s);
    setBoxH((prev) => (prev === nextH ? prev : nextH));
  }, []);

  useLayoutEffect(() => {
    const pre = preRef.current;
    if (pre && frames.length) pre.textContent = frames[0];
    applyScale();
    const id = requestAnimationFrame(() => applyScale());
    return () => cancelAnimationFrame(id);
  }, [applyScale]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => applyScale());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [applyScale]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const onChange = () => applyScale();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [applyScale]);

  useEffect(() => {
    if (!frames.length) return;
    const pre = preRef.current;
    if (!pre) return;

    if (prefersReducedMotion) {
      pre.textContent = frames[0];
      requestAnimationFrame(applyScale);
      return;
    }

    const start = performance.now();
    let lastIndex = -1;
    const frameMs = 1000 / (fps * PLAYBACK_SPEED);
    let id: number;

    const tick = (now: number) => {
      const i = Math.floor((now - start) / frameMs) % frames.length;
      if (i !== lastIndex) {
        lastIndex = i;
        pre.textContent = frames[i];
        requestAnimationFrame(applyScale);
      }
      id = requestAnimationFrame(tick);
    };

    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [applyScale, prefersReducedMotion]);

  return (
    <a
      ref={wrapRef}
      href="https://ascii.samirmd.com"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block w-full min-w-0 cursor-pointer overflow-hidden rounded-sm bg-transparent p-0 text-inherit no-underline outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      style={boxH > 0 ? { height: boxH } : undefined}
      aria-label="ASCII art on ascii.samirmd.com (opens in a new tab)"
    >
      <div ref={innerRef} className="inline-block will-change-transform">
        <pre
          ref={preRef}
          className="text-ink font-mono text-[16.5px] leading-[1.15] tracking-normal antialiased sm:text-[18px]"
          style={{ whiteSpace: "pre", fontFamily: "ui-monospace, monospace" }}
          aria-hidden="true"
        />
      </div>
    </a>
  );
}
