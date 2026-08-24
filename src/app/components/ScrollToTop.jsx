"use client";

import { useEffect, useState } from "react";

/**
 * Pen pot: an outlined ruler with tick marks between two solid brushes,
 * standing in a dotted cup. Shapes are kept chunky so they still read at ~40px.
 * Everything uses currentColor so the whole mark inverts on hover.
 */
function PenPotIcon(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      {/* Left brush */}
      <path d="M9.8 5.4 15 8.2 18.6 27H12.4Z" fill="currentColor" />
      {/* Right brush */}
      <path d="M38.2 5.4 33 8.2 29.4 27h6.2Z" fill="currentColor" />

      {/* Ruler */}
      <rect
        x="19.8"
        y="4.6"
        width="8.4"
        height="22.4"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="2.3"
      />
      <path
        d="M19.8 10h3.6M19.8 15h3.6M19.8 20h3.6"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />

      {/* Cup */}
      <path
        d="M9 27h30v11.6A5.4 5.4 0 0 1 33.6 44H14.4A5.4 5.4 0 0 1 9 38.6Z"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      {/* Dots */}
      <g fill="currentColor">
        <circle cx="15.2" cy="32.4" r="2" />
        <circle cx="21.1" cy="32.4" r="2" />
        <circle cx="26.9" cy="32.4" r="2" />
        <circle cx="32.8" cy="32.4" r="2" />
        <circle cx="15.2" cy="38.4" r="2" />
        <circle cx="21.1" cy="38.4" r="2" />
        <circle cx="26.9" cy="38.4" r="2" />
        <circle cx="32.8" cy="38.4" r="2" />
      </g>
    </svg>
  );
}

export default function ScrollToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div
      className={
        "group fixed bottom-6 right-6 z-50 flex items-center gap-3 transition-all duration-300 " +
        (shown
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0")
      }
    >
      {/* Hover label */}
      <span
        aria-hidden="true"
        className="pointer-events-none relative translate-x-3 whitespace-nowrap bg-ink px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[1.5px] text-white opacity-0 shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
      >
        Back to top
        {/* little arrow pointing at the button */}
        <span className="absolute right-[-4px] top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-ink" />
      </span>

      <button
        onClick={toTop}
        aria-label="Back to top"
        tabIndex={shown ? 0 : -1}
        className="group/btn flex h-[62px] w-[62px] shrink-0 items-center justify-center text-primary transition-colors duration-300 hover:text-primary-hover lg:h-[74px] lg:w-[74px]"
      >
        <PenPotIcon className="h-11 w-11 transition-transform duration-300 group-hover/btn:scale-110 lg:h-[52px] lg:w-[52px]" />
      </button>
    </div>
  );
}
