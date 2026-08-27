"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";


const AUTOPLAY_MS = 3800;

export default function CoverSlider({ books = [] }) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const scrollTo = useCallback((next) => {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector("[data-cover]");
    if (!card) return;

    const step = card.offsetWidth + 24;
    const count = books.length;
    if (!count) return;

    const target = ((next % count) + count) % count;

    // Don't scroll past the end — clamp to the last full page of cards.
    const max = track.scrollWidth - track.clientWidth;
    track.scrollTo({ left: Math.min(target * step, max), behavior: "smooth" });
    setIndex(target);
  }, [books.length]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      const track = trackRef.current;
      if (!track) return;
      const atEnd =
        track.scrollLeft >= track.scrollWidth - track.clientWidth - 8;
      scrollTo(atEnd ? 0 : index + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [index, paused, scrollTo]);

  if (books.length === 0) return null;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {books.map((book) => (
          <figure
            key={book.slug}
            data-cover
            className="group w-[220px] shrink-0 snap-start sm:w-[250px] lg:w-[280px]"
          >
            <div className="overflow-hidden bg-surface">
              <img
                src={book.image}
                alt={"ChoiceKraft " + book.name + " " + book.type}
                loading="lazy"
                className="aspect-[707/1000] w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
              />
            </div>

            <figcaption className="mt-4">
              <p className="text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
                {book.type}
              </p>
              <p className="mt-1 text-[16px] font-bold text-ink">{book.name}</p>
              {book.quote && (
                <p className="mt-1.5 text-[13px] italic leading-[21px] text-muted">
                  &ldquo;{book.quote}&rdquo;
                </p>
              )}
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Autoplay progress */}
      <div className="mt-8 h-[2px] w-full bg-line">
        <div
          className="h-full bg-primary transition-[width] duration-500 ease-out"
          style={{
            width: ((index + 1) / books.length) * 100 + "%",
          }}
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        {/* Dots */}
        <div className="flex gap-2">
          {books.map((book, i) => (
            <button
              key={book.slug}
              onClick={() => scrollTo(i)}
              aria-label={"Show " + book.name}
              aria-current={i === index}
              className="flex h-11 items-center px-1"
            >
              <span
                className={
                  "block h-2 rounded-full transition-all duration-300 " +
                  (i === index ? "w-7 bg-primary" : "w-2 bg-line hover:bg-muted")
                }
              />
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => scrollTo(index - 1)}
            aria-label="Previous cover"
            className="flex h-11 w-11 items-center justify-center border border-line bg-white text-ink transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <button
            onClick={() => scrollTo(index + 1)}
            aria-label="Next cover"
            className="flex h-11 w-11 items-center justify-center border border-line bg-white text-ink transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronRight size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
