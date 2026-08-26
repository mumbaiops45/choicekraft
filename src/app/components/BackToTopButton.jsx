"use client";

/**
 * The arrow artwork. The PNG is a flat silhouette, so it is used as a mask and
 * tinted with the brand magenta rather than shipped pre-coloured.
 */
export function TopArrowMark({ className = "" }) {
  return (
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
      className={"block bg-magenta-500 " + className}
    />
  );
}

export function scrollToTop() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
}

/**
 * Back-to-top control that lives inline in the footer rather than floating
 * over the page. Stacked as a compact column — label above icon — so it can sit
 * beside the social-icon line instead of adding a block of its own below the
 * newsletter.
 */
export default function BackToTopButton({ className = "" }) {
  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={
        "group/btn flex flex-col items-center gap-2.5 text-white/60 transition-colors duration-300 hover:text-white " +
        className
      }
    >
    
      <TopArrowMark className="h-9 w-9 transition-transform duration-300 group-hover/btn:-translate-y-1" />
        <span className="text-[10px] font-semibold uppercase tracking-[1.5px]">
        Back to top
      </span>
    </button>
  );
}
