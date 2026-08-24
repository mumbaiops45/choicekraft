"use client";

import { useEffect, useState } from "react";

/** Breathing room left between the floating stack and the top of the footer. */
const GAP = 16;

/**
 * How far the fixed bottom-right stack has to lift so it never sits on top of
 * the footer. Returns 0 while the footer is still below the fold; once the
 * footer scrolls in, the value grows with the visible part of it.
 *
 * Apply it as `marginBottom` — a fixed element pinned with `bottom` is pushed
 * up by its bottom margin, which leaves the responsive `bottom-*` classes and
 * any `translate-y` transitions alone.
 */
export default function useFooterOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const footer = document.querySelector("[data-site-footer]");
    if (!footer) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const { top } = footer.getBoundingClientRect();
      setOffset(Math.max(0, window.innerHeight - top + GAP));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return offset;
}
