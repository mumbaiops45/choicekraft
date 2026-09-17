"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Banners come from the backend (GET /banners?type=homepage), admin-managed —
// title, discount badge, description and an optional button are rendered as
// a real overlay here rather than baked into the image, so copy can change
// without touching artwork. See bannerService.getBannersSafe.
//
// The frame keeps a fixed ~1903:928 ratio at every width rather than a fixed
// height. A fixed height plus object-cover crops the sides, and on a 360px
// phone that threw away 41% of the banner width — roughly a fifth off each
// edge. Height simply follows the viewport instead.
const AUTOPLAY_MS = 5000;

export default function Hero({ banners = [] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (next) => {
      setIndex((current) => (next + banners.length) % banners.length);
    },
    [banners.length]
  );

  useEffect(() => {
    if (paused || banners.length < 2) return;
    const timer = setInterval(() => go(index + 1), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [index, paused, go, banners.length]);

  if (banners.length === 0) return null;

  return (
    <section
      aria-label="Featured offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="group relative w-full overflow-hidden bg-ink"
    >
      <div className="relative aspect-[1903/928] w-full">
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            aria-hidden={i !== index}
            className={
              "absolute inset-0 bg-ink transition-opacity duration-700 ease-out " +
              (i === index ? "opacity-100" : "pointer-events-none opacity-0")
            }
          >
            <img
              src={banner.image}
              alt={banner.title || "ChoiceKraft offer"}
              loading={i === 0 ? "eager" : "lazy"}
              // A dead admin-uploaded URL should still leave the overlay
              // text readable rather than alt text over a blank square.
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              className={
                "h-full w-full object-cover object-center transition-transform ease-out " +
                (i === index
                  ? "duration-[6000ms] lg:scale-105"
                  : "scale-100 duration-0")
              }
            />

            {/* Light, centred vignette — just enough for the text to read,
                without washing out the photo underneath it. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 55% 65% at 50% 50%, rgba(15,15,18,0.55) 0%, rgba(15,15,18,0.22) 60%, rgba(15,15,18,0) 85%)",
              }}
            />

            <div className="absolute inset-0 flex items-center justify-center px-6 text-center sm:px-10 lg:px-16">
              <div className="ck-rise max-w-[560px]">
                {banner.discount && (
                  <span className="inline-block animate-pulse rounded-full bg-primary px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[1.5px] text-primary-foreground shadow-lg sm:px-5 sm:py-2 sm:text-[13px] lg:px-6 lg:text-[14px]">
                    {banner.discount}
                  </span>
                )}

                {banner.title && (
                  <h2 className="mt-5 text-3xl font-extrabold leading-[1.1] tracking-[-0.5px] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.35)] sm:text-5xl lg:text-[58px]">
                    {banner.title}
                  </h2>
                )}

                {banner.description && (
                  <p className="mx-auto mt-4 max-w-[420px] text-[15px] leading-7 text-white/90 sm:text-[17px] lg:text-[19px]">
                    {banner.description}
                  </p>
                )}

                {banner.buttonText && banner.href && (
                  <Link
                    href={banner.href}
                    tabIndex={i === index ? 0 : -1}
                    className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-primary px-9 py-4 text-[13px] font-bold uppercase tracking-[1.5px] text-primary-foreground shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_14px_36px_rgba(0,0,0,0.35)]"
                  >
                    {banner.buttonText}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          {/* Prev / next */}
          <button
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white opacity-0 backdrop-blur-sm transition hover:bg-primary focus:opacity-100 group-hover:opacity-100 lg:left-10 lg:h-14 lg:w-14"
          >
            <ChevronLeft size={26} strokeWidth={1.8} />
          </button>

          <button
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white opacity-0 backdrop-blur-sm transition hover:bg-primary focus:opacity-100 group-hover:opacity-100 lg:right-10 lg:h-14 lg:w-14"
          >
            <ChevronRight size={26} strokeWidth={1.8} />
          </button>

          {/* Dots */}
          <div className="ck-rise absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2.5 lg:bottom-12">
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                onClick={() => go(i)}
                aria-label={"Go to slide " + (i + 1)}
                aria-current={i === index}
                className="flex h-11 items-center px-1"
              >
                <span
                  className={
                    "block h-2.5 rounded-full transition-all duration-400 " +
                    (i === index
                      ? "w-8 bg-primary"
                      : "w-2.5 bg-white/70 hover:bg-white")
                  }
                />
              </button>
            ))}
          </div>

          {/* Slide progress */}
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/15">
            <div
              className="h-full bg-primary transition-[width] duration-700 ease-out"
              style={{ width: ((index + 1) / banners.length) * 100 + "%" }}
            />
          </div>
        </>
      )}
    </section>
  );
}
