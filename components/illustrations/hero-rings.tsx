// Decorative ring/donut graphic for the landing page. Built as SVG so it
// stays sharp at any size and respects the theme color tokens. The arc
// math was easier to just hand-write than pull in another library.

interface Arc {
  start: number;
  end: number;
  color: string;
  inner: number;
  outer: number;
}

const TAU = Math.PI * 2;

function polar(cx: number, cy: number, r: number, t: number) {
  const a = t - Math.PI / 2;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
}

function arcPath(cx: number, cy: number, arc: Arc): string {
  const { start, end, inner, outer } = arc;
  const [ox1, oy1] = polar(cx, cy, outer, start);
  const [ox2, oy2] = polar(cx, cy, outer, end);
  const [ix1, iy1] = polar(cx, cy, inner, end);
  const [ix2, iy2] = polar(cx, cy, inner, start);
  const large = end - start > Math.PI ? 1 : 0;
  return [
    `M ${ox1} ${oy1}`,
    `A ${outer} ${outer} 0 ${large} 1 ${ox2} ${oy2}`,
    `L ${ix1} ${iy1}`,
    `A ${inner} ${inner} 0 ${large} 0 ${ix2} ${iy2}`,
    "Z",
  ].join(" ");
}

// Two stacked donuts: outer ring is a stylized "sector" breakdown, inner
// ring is a thinner "industry" detail layer. Numbers chosen so it just
// looks compositional rather than representing real data.
const OUTER: Arc[] = [
  { start: 0, end: 0.28 * TAU, color: "var(--chart-1)", inner: 110, outer: 150 },
  { start: 0.28 * TAU, end: 0.5 * TAU, color: "var(--chart-2)", inner: 110, outer: 150 },
  { start: 0.5 * TAU, end: 0.66 * TAU, color: "var(--chart-3)", inner: 110, outer: 150 },
  { start: 0.66 * TAU, end: 0.84 * TAU, color: "var(--chart-4)", inner: 110, outer: 150 },
  { start: 0.84 * TAU, end: TAU, color: "var(--chart-5)", inner: 110, outer: 150 },
];

const INNER: Arc[] = [
  { start: 0, end: 0.18 * TAU, color: "var(--chart-3)", inner: 65, outer: 95 },
  { start: 0.18 * TAU, end: 0.45 * TAU, color: "var(--chart-1)", inner: 65, outer: 95 },
  { start: 0.45 * TAU, end: 0.7 * TAU, color: "var(--chart-4)", inner: 65, outer: 95 },
  { start: 0.7 * TAU, end: TAU, color: "var(--chart-2)", inner: 65, outer: 95 },
];

export function HeroRings({ className }: { className?: string }) {
  const cx = 175;
  const cy = 175;
  return (
    <svg
      viewBox="0 0 350 350"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <g opacity="0.92">
        {OUTER.map((a, i) => (
          <path key={`o${i}`} d={arcPath(cx, cy, a)} fill={a.color} />
        ))}
      </g>
      <g opacity="0.96">
        {INNER.map((a, i) => (
          <path key={`i${i}`} d={arcPath(cx, cy, a)} fill={a.color} />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={48} fill="var(--background)" />
      <circle
        cx={cx}
        cy={cy}
        r={48}
        fill="none"
        stroke="var(--border)"
        strokeWidth="1"
      />
    </svg>
  );
}
