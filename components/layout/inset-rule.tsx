/** Horizontal rule inset from the viewport edges so it does not read wall to wall. */
export function InsetRule() {
  return (
    <div className="mx-auto max-w-6xl px-8 sm:px-12 md:px-20">
      <div className="h-px bg-border/80" aria-hidden />
    </div>
  );
}
