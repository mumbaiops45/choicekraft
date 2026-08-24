"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades / slides its children in the first time they scroll into view.
 *
 * Fail-safe by design: the server renders children VISIBLE. The hidden state is
 * applied on the client only, and only to elements still below the fold — so a
 * blocked or slow script can never leave content permanently invisible.
 * Skipped entirely under prefers-reduced-motion.
 *
 * Note there is deliberately no timer that force-reveals: one would fire while
 * the content was still far below the fold and burn the animation before the
 * reader ever got there. The observer is the only thing that unhides.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 28,
  as: Tag = "div",
  className = "",
}) {
  const ref = useRef(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    // Already on screen at mount — don't hide it, that would flash.
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    setHidden(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHidden(false);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? "translateY(" + y + "px)" : "none",
        transition:
          "opacity 700ms cubic-bezier(0.22,1,0.36,1) " +
          delay +
          "ms, transform 700ms cubic-bezier(0.22,1,0.36,1) " +
          delay +
          "ms",
      }}
    >
      {children}
    </Tag>
  );
}
