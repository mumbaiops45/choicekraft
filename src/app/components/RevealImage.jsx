"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Image that wipes into view behind a moving curtain.
 *
 * Fail-safe by design: the server renders it FULLY VISIBLE. The hidden state is
 * only ever applied on the client, and only to elements that are still below
 * the fold. So if JS is slow, blocked, or the observer never fires, the image
 * is visible anyway — it can never be permanently blank.
 */
export default function RevealImage({
  src,
  alt,
  ratio = "aspect-[3/4]",
  delay = 0,
  from = "left",
  className = "",
}) {
  const ref = useRef(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    // Already on screen at mount? Leave it alone — hiding it now would flash.
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
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(node);

    // Backstop: whatever happens, reveal within 2.5s.
    const failsafe = setTimeout(() => {
      setHidden(false);
      observer.disconnect();
    }, 2500);

    return () => {
      observer.disconnect();
      clearTimeout(failsafe);
    };
  }, []);

  const closed =
    from === "right"
      ? "inset(0 0 0 100%)"
      : from === "bottom"
        ? "inset(100% 0 0 0)"
        : "inset(0 100% 0 0)";

  return (
    <div
      ref={ref}
      className={"group overflow-hidden " + ratio + " " + className}
      style={{
        clipPath: hidden ? closed : "inset(0 0 0 0)",
        transition:
          "clip-path 900ms cubic-bezier(0.77,0,0.175,1) " + delay + "ms",
      }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover"
        style={{
          transform: hidden ? "scale(1.18)" : "scale(1)",
          transition:
            "transform 1400ms cubic-bezier(0.22,1,0.36,1) " + delay + "ms",
        }}
      />
    </div>
  );
}
