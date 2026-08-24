"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// The banner artwork already has its headline, copy and SHOP NOW button baked
// into the JPEG, so the slider only cross-fades images — no text overlay. The
// native ratio (1903x928) is preserved so that baked-in text is never cropped.
const slides = [
  { src: "/images/main-banner-1.jpg", alt: "Up to 85% off stationery", href: "/stationery" },
  { src: "/images/main-banner-2.jpg", alt: "Up to 55% off desk supplies", href: "/products" },
  { src: "/images/main-banner-3.jpg", alt: "New season note books", href: "/notebooks" },
];

const AUTOPLAY_MS = 5000;

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next) => {
    setIndex((current) => (next + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => go(index + 1), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [index, paused, go]);

  return (
    <section
      aria-label="Featured offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="group relative w-full overflow-hidden bg-ink"
    >
      <div className="relative h-[300px] w-full sm:h-[420px] md:h-[520px] lg:aspect-[1903/928] lg:h-auto">
        {slides.map((slide, i) => (
          <Link
            key={slide.src}
            href={slide.href}
            tabIndex={i === index ? 0 : -1}
            aria-hidden={i !== index}
            className={
              "absolute inset-0 transition-opacity duration-700 ease-out " +
              (i === index ? "opacity-100" : "pointer-events-none opacity-0")
            }
          >
            <img
              src={slide.src}
              alt={slide.alt}
              loading={i === 0 ? "eager" : "lazy"}
              className={
                "h-full w-full object-cover object-center transition-transform ease-out " +
                (i === index
                  ? "scale-105 duration-[6000ms]"
                  : "scale-100 duration-0")
              }
            />
          </Link>
        ))}
      </div>

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
        {slides.map((slide, i) => (
          <button
            key={slide.src}
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
          style={{ width: ((index + 1) / slides.length) * 100 + "%" }}
        />
      </div>
    </section>
  );
}
