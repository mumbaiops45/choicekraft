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

        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="group relative mt-10 w-full overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
        >
          {/* 16:9 rather than a cinematic wide ratio — the admin-uploaded
              photos are square/portrait, not wide banner shots like Hero's,
              and a wide frame forced heavy cropping (or letterboxing) to fit
              them. This ratio is close enough to the source photos that
              object-cover fills the frame edge to edge with nothing added
              and barely anything lost.
              A pure aspect ratio still grows tall in real pixels on a wide
              desktop container, though, so it's capped with a max-height on
              top — object-cover just crops a little more off the photo
              once that cap is doing the work instead of the ratio. */}
          <div className="relative aspect-video max-h-[260px] w-full sm:max-h-[340px] lg:max-h-[420px]">
            {offers.map((offer, i) => (
              <div
                key={offer.id}
                aria-hidden={i !== index}
                className={
                  "absolute inset-0 bg-ink transition-opacity duration-700 ease-out " +
                  (i === index ? "opacity-100" : "pointer-events-none opacity-0")
                }
              >
                <img
                  src={offer.image}
                  alt={offer.title || "ChoiceKraft offer"}
                  loading={i === 0 ? "eager" : "lazy"}
                  // A dead admin-uploaded URL should still leave the
                  // overlay text readable rather than alt text over a
                  // blank square.
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className={
                    "h-full w-full object-cover object-center transition-transform ease-out " +
                    (i === index ? "duration-[5000ms] lg:scale-105" : "scale-100 duration-0")
                  }
                />

                {/* Centred vignette, same technique as Hero — enough to
                    read the text over, without washing out the photo. */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse 60% 75% at 50% 50%, rgba(15,15,18,0.6) 0%, rgba(15,15,18,0.25) 60%, rgba(15,15,18,0) 85%)",
                  }}
                />

                <div className="absolute inset-0 flex items-center justify-center px-6 text-center sm:px-10 lg:px-16">
                  <div className="ck-rise max-w-[480px]">
                    {offer.discount && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[1px] text-primary-foreground shadow-lg sm:text-[13px]">
                        <Zap size={13} strokeWidth={2.5} fill="currentColor" />
                        {offer.discount}
                      </span>
                    )}

                    {offer.title && (
                      <h3 className="mt-3 text-xl font-extrabold uppercase leading-[1.15] tracking-[0.3px] text-white sm:mt-4 sm:text-2xl lg:text-[34px]">
                        {offer.title}
                      </h3>
                    )}

                    {offer.description && (
                      <p className="mx-auto mt-2 hidden max-w-[400px] text-[14px] leading-6 text-white/85 sm:block lg:text-[16px]">
                        {offer.description}
                      </p>
                    )}

                    {offer.buttonText && offer.href && (
                      <Link
                        href={offer.href}
                        tabIndex={i === index ? 0 : -1}
                        className="group/btn mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[11px] font-bold uppercase tracking-[1px] text-ink shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground sm:mt-5 sm:px-6 sm:py-3 sm:text-[12px]"
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
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white opacity-0 backdrop-blur-sm transition hover:bg-primary focus:opacity-100 group-hover:opacity-100 sm:left-5 sm:h-12 sm:w-12"
              >
                <ChevronLeft size={22} strokeWidth={1.8} />
              </button>

              <button
                onClick={() => go(index + 1)}
                aria-label="Next offer"
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white opacity-0 backdrop-blur-sm transition hover:bg-primary focus:opacity-100 group-hover:opacity-100 sm:right-5 sm:h-12 sm:w-12"
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
      </div>
    </section>
  );
}
