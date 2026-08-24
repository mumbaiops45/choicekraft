"use client";

import { useEffect, useState } from "react";

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
        className="group/btn flex h-[62px] w-[62px] shrink-0 items-center justify-center lg:h-[74px] lg:w-[74px]"
      >
        {/* The PNG is a flat silhouette, so it is used as a mask and tinted
            with the brand magenta rather than shipped pre-coloured. */}
        <span
          aria-hidden="true"
          style={{
            maskImage: "url('/images/top-arrow.png')",
            WebkitMaskImage: "url('/images/top-arrow.png')",
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
          }}
          className="block h-11 w-11 bg-magenta-500 transition-transform duration-300 group-hover/btn:scale-110 lg:h-[52px] lg:w-[52px]"
        />
      </button>
    </div>
  );
}
