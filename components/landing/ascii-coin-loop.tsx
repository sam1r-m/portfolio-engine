"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { fps, frames } from "@/lib/data/ascii-coin-frames.js";
import { cn } from "@/lib/utils";

/** >1 plays faster than the export’s nominal fps (1.8 ≈ 80% faster). */
const PLAYBACK_SPEED = 1.3;

/**
 * DOM ascii loop (selectable text). Data from ascii-mation export
 * (`ascii-coin-frames.js`): `fps` + `frames` template strings.
 * Scales to the column width so the grid does not get blown out by long lines.
 */
export function AsciiCoinLoop({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [boxH, setBoxH] = useState(0);

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

    // Never exceed column width: scaled width = pw * s <= cw  =>  s <= fit = cw/pw.
    // Up to 1.8× natural size when the column is wide enough (80% larger than 1×).
    const fit = cw / pw;
    const maxScale = 1.8;
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
    if (!frames.length) return;
    const pre = preRef.current;
    if (!pre) return;

    let start = performance.now();
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
  }, [applyScale]);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "w-full min-w-0 overflow-x-visible overflow-y-hidden bg-transparent p-0",
        className,
      )}
      style={boxH > 0 ? { height: boxH } : undefined}
    >
      <div ref={innerRef} className="inline-block will-change-transform">
        <pre
          ref={preRef}
          className="font-mono text-[11px] leading-[1.15] tracking-normal text-[#000000] antialiased sm:text-[18px]"
          style={{ whiteSpace: "pre", fontFamily: "ui-monospace, monospace" }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
