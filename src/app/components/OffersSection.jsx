"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Flame, Timer, Zap } from "lucide-react";
import Reveal from "./Reveal";

/**
 * Ticks down to `target` (a Date/timestamp) every second.
 * Returns null once it has passed, before mount, or when `target` was never
 * given — callers treat all three the same way: nothing to show.
 *
 * `now` starts at null rather than Date.now(): the server and the client
 * hydrate at slightly different instants, and seeding it from the clock
 * during render made the very first tick disagree between them (a real
 * hydration mismatch, not a hypothetical one). Waiting for the effect keeps
 * the server and the first client render identical — the countdown fills in
 * a beat after mount instead.
 */
function useCountdown(target) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    if (!target) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!target || now === null) return null;
  const diff = target - now;
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

const pad = (n) => String(n).padStart(2, "0");
const AUTOPLAY_MS = 4500;

/**
 * Deal banner from the backend (GET /banners?type=offer), admin-managed.
 *
 * One full-width banner at a time — same crossfade-carousel shape as Hero —
 * rather than several small cards side by side, so each deal gets full
 * attention instead of competing for a sliver of the row.
 */
export default function OffersSection({ offers = [] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (next) => {
      setIndex((current) => (next + offers.length) % offers.length);
    },
    [offers.length]
  );

  useEffect(() => {
    if (paused || offers.length < 2) return;
    const timer = setInterval(() => go(index + 1), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [index, paused, go, offers.length]);

  // The soonest deadline across the current batch — one countdown for the
  // whole section rather than a duplicate ticking clock on every slide.
  const deadline = offers.reduce((soonest, offer) => {
    if (!offer.endDate) return soonest;
    const t = new Date(offer.endDate).getTime();
    if (Number.isNaN(t)) return soonest;
    return soonest === null ? t : Math.min(soonest, t);
  }, null);
  const countdown = useCountdown(deadline);

  if (offers.length === 0) return null;

  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-[1510px] px-6">
        <Reveal className="text-center">
          <p className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[3px] text-primary">
            <Flame size={16} strokeWidth={2.2} className="animate-pulse" />
            Limited time
          </p>
          <h2 className="mt-3 text-3xl font-bold uppercase leading-[1.2] tracking-[0.5px] text-ink lg:text-[40px]">
            Today&rsquo;s <span className="text-primary">deals</span>
          </h2>

          {countdown && (
            <div className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary-soft px-4 py-2.5 shadow-sm">
              <Timer size={16} strokeWidth={2.2} className="shrink-0 text-primary" />
              <span className="text-[12px] font-semibold uppercase tracking-[1px] text-primary-hover">
                Ends in
              </span>
              <span className="font-mono text-[15px] font-bold tabular-nums text-ink">
                {countdown.days > 0 && `${countdown.days}d `}
                {pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)}
              </span>
            </div>
          )}
        </Reveal>
      </div>

      {/* Full page width, same as Hero and the offer ticker above it — a
          "wide, borderless banner" reads wrong pinned to the 1510px content
          column with white margins down each side.
          Just w-full, not the 100vw/-50vw break-out trick: this div is
          already a direct child of <section>, which carries no max-width or
          padding of its own, so it's full width for free. 100vw measures
          the viewport including the scrollbar gutter, which is very
          slightly wider than the page actually renders — that's what was
          causing the horizontal scrollbar. */}
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="group relative mt-10 w-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
      >
        {/* Full-bleed photo, nothing dividing it — no panel, no scrim, no
            vignette. Ink-coloured text sits directly on the image, which
            is why it needs to stay dark: it's readable against most of
            the offer photos (they trend light), not because of anything
            added behind it. */}
        <div className="relative aspect-video max-h-[260px] w-full sm:max-h-[340px] lg:max-h-[420px]">
          {offers.map((offer, i) => (
            <div
              key={offer.id}
              aria-hidden={i !== index}
              className={
                "absolute inset-0 bg-surface transition-opacity duration-700 ease-out " +
                (i === index ? "opacity-100" : "pointer-events-none opacity-0")
              }
            >
              <img
                src={offer.image}
                alt={offer.title || "ChoiceKraft offer"}
                loading={i === 0 ? "eager" : "lazy"}
                // A dead admin-uploaded URL should still leave the copy
                // readable rather than alt text over a blank square.
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                className={
                  "h-full w-full object-cover object-center transition-transform ease-out " +
                  (i === index ? "duration-[5000ms] lg:scale-105" : "scale-100 duration-0")
                }
              />

              <div className="absolute inset-0 flex items-center justify-center px-6 text-center sm:px-10 lg:px-14">
                <div className="ck-rise max-w-[90%] sm:max-w-[60%] lg:max-w-[640px]">
                  {offer.discount && (
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[1px] text-primary-foreground sm:text-[13px]">
                      <Zap size={13} strokeWidth={2.5} fill="currentColor" />
                      {offer.discount}
                    </span>
                  )}

                  {offer.title && (
                    <h3 className="mt-3 text-xl font-extrabold uppercase leading-[1.15] tracking-[0.3px] text-ink sm:text-2xl lg:text-[32px]">
                      {offer.title}
                    </h3>
                  )}

                  {offer.description && (
                    <p className="mx-auto mt-2 hidden max-w-[480px] text-[14px] leading-6 text-ink-soft sm:block lg:text-[16px]">
                      {offer.description}
                    </p>
                  )}

                  {offer.buttonText && offer.href && (
                    <Link
                      href={offer.href}
                      tabIndex={i === index ? 0 : -1}
                      className="group/btn mx-auto mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-ink px-6 py-3 text-[11px] font-bold uppercase tracking-[1px] text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary sm:mt-5 sm:text-[12px]"
                    >
                      {offer.buttonText}
                      <ArrowRight
                        size={14}
                        strokeWidth={2.4}
                        className="transition-transform duration-300 group-hover/btn:translate-x-1"
                      />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {offers.length > 1 && (
          <>
            <button
              onClick={() => go(index - 1)}
              aria-label="Previous offer"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm transition hover:bg-primary sm:left-5 sm:h-12 sm:w-12 lg:opacity-0 lg:focus:opacity-100 lg:group-hover:opacity-100"
            >
              <ChevronLeft size={22} strokeWidth={1.8} />
            </button>

            <button
              onClick={() => go(index + 1)}
              aria-label="Next offer"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm transition hover:bg-primary sm:right-5 sm:h-12 sm:w-12 lg:opacity-0 lg:focus:opacity-100 lg:group-hover:opacity-100"
            >
              <ChevronRight size={22} strokeWidth={1.8} />
            </button>

            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-6">
              {offers.map((offer, i) => (
                <button
                  key={offer.id}
                  onClick={() => go(i)}
                  aria-label={"Go to offer " + (i + 1)}
                  aria-current={i === index}
                  className="flex h-8 items-center px-1"
                >
                  <span
                    className={
                      "block h-2 rounded-full transition-all duration-400 " +
                      (i === index ? "w-6 bg-primary" : "w-2 bg-white/70 hover:bg-white")
                    }
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
