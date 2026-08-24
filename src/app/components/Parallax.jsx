"use client";

import { useEffect, useRef } from "react";

/**
 * Full-bleed band whose background image drifts against the scroll.
 *
 * Uses a transform driven by requestAnimationFrame rather than
 * `background-attachment: fixed`, which iOS Safari ignores and desktop
 * browsers repaint badly. Work only happens while the band is on screen,
 * and is skipped entirely for prefers-reduced-motion.
 */
export default function Parallax({
  src,
  alt = "",
  speed = 0.2,
  overlay = "bg-ink/72",
  position = "center",
  className = "",
  children,
}) {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    if (!section || !image) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = null;
    let onScreen = false;

    const update = () => {
      frame = null;
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;

      // -1 when the band sits below the fold, +1 once it has passed above it.
      const progress =
        (rect.top + rect.height / 2 - viewport / 2) /
        (viewport / 2 + rect.height / 2);

      const shift = progress * speed * rect.height;
      image.style.transform = "translate3d(0," + shift.toFixed(2) + "px,0)";
    };

    const request = () => {
      if (!onScreen || frame !== null) return;
      frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) request();
    });

    observer.observe(section);
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [speed]);

  return (
    <section
      ref={sectionRef}
      className={"relative isolate overflow-hidden " + className}
    >
      {/* Oversized and offset so the drift never exposes an edge */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        aria-hidden={alt ? undefined : "true"}
        className="pointer-events-none absolute left-0 top-[-25%] -z-10 h-[150%] w-full object-cover will-change-transform"
        style={{ objectPosition: position }}
      />

      <span aria-hidden="true" className={"absolute inset-0 -z-10 " + overlay} />

      {children}
    </section>
  );
}
