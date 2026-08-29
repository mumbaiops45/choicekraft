"use client";

import { useEffect, useState } from "react";

import useFooterOffset from "../hooks/useFooterOffset";
import { TopArrowMark, scrollToTop } from "./BackToTopButton";

/**
 * Floating back-to-top button. Appears once the page has been scrolled a
 * screenful or so, and steps aside when the footer — which carries its own
 * back-to-top button — comes into view, so only one is ever on screen.
 *
 * Desktop only. On a phone this stacked with the WhatsApp and call buttons
 * into a permanent 200px-tall column down the right edge, sitting over card
 * buttons and quantity steppers. Flick-to-scroll makes it the least useful of
 * the three, and the footer keeps its own back-to-top for anyone who wants
 * one.
 */
export default function ScrollToTop() {
  const [scrolled, setScrolled] = useState(false);
  const footerOffset = useFooterOffset();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const shown = scrolled && footerOffset === 0;

  return (
    <div
      className={
        "group fixed bottom-6 right-6 z-50 hidden items-center gap-3 transition-all duration-300 lg:flex " +
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
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        tabIndex={shown ? 0 : -1}
        className="group/btn flex h-[62px] w-[62px] shrink-0 items-center justify-center lg:h-[74px] lg:w-[74px]"
      >
        <TopArrowMark className="h-11 w-11 transition-transform duration-300 group-hover/btn:scale-110 lg:h-[52px] lg:w-[52px]" />
      </button>
    </div>
  );
}
