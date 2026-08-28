"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingBag, Eye } from "lucide-react";
import { formatINR } from "@/lib/formatters/currency";
import Reveal from "./Reveal";
import { useCart } from "../context/CartContext";

const AUTOPLAY_MS = 4200;

export default function FeaturedProducts({ products = [] }) {
  const trackRef = useRef(null);
  const { add } = useCart();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const scrollTo = useCallback((next) => {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector("[data-card]");
    if (!card) return;

    const step = card.offsetWidth + 24;
    const count = products.length;
    if (!count) return;

    const target = ((next % count) + count) % count;
    const max = track.scrollWidth - track.clientWidth;

    track.scrollTo({ left: Math.min(target * step, max), behavior: "smooth" });
    setIndex(target);
  }, [products.length]);

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

  // Nothing to slide through — drop the section rather than render an empty
  // rail under a heading.
  if (products.length === 0) return null;

  return (
    <section
      className="bg-surface-alt py-20 lg:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-[1510px] px-6">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold uppercase leading-[1.2] tracking-[0.5px] text-ink lg:text-[40px]">
              Premium <span className="text-primary">note books</span>
            </h2>
            <p className="mt-5 max-w-[520px] leading-8 text-muted">
              Printed and bound in our own facility, on 60 GSM paper, with covers
              you will actually want to keep.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => scrollTo(index - 1)}
              aria-label="Previous product"
              className="flex h-11 w-11 items-center justify-center border border-line bg-white text-ink transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              <ChevronLeft size={20} strokeWidth={2} />
            </button>
            <button
              onClick={() => scrollTo(index + 1)}
              aria-label="Next product"
              className="flex h-11 w-11 items-center justify-center border border-line bg-white text-ink transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              <ChevronRight size={20} strokeWidth={2} />
            </button>
          </div>
        </Reveal>

        {/* Rail — snaps card to card */}
        <div
          ref={trackRef}
          className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product, i) => {
            const off = product.mrp
              ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
              : 0;

            return (
              <Reveal
                key={product.slug}
                delay={i * 70}
                className="w-[240px] shrink-0 snap-start sm:w-[265px]"
              >
                <article
                  data-card
                  className="group h-full border border-line bg-white transition-all duration-500 hover:-translate-y-2 hover:border-transparent hover:shadow-[0_22px_45px_rgba(0,0,0,0.14)]"
                >
                  <div className="relative overflow-hidden bg-surface">
                    <div className="aspect-[707/1000] w-full">
                      <img
                        src={product.image}
                        alt={"ChoiceKraft " + product.name + " " + product.type}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.07]"
                      />
                    </div>

                    {/* Badges stack left — the printed logo sits top-right */}
                    <div className="pointer-events-none absolute left-0 top-4 flex flex-col items-start gap-2">
                      {product.badge && (
                        <span className="bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[1.5px] text-primary-foreground">
                          {product.badge}
                        </span>
                      )}
                      {off > 0 && (
                        <span className="bg-secondary px-3 py-1.5 text-[10px] font-bold tracking-[1px] text-secondary-foreground">
                          {off}% OFF
                        </span>
                      )}
                    </div>

                    {/* Quick actions slide up on hover */}
                    <div className="absolute inset-x-0 bottom-0 flex translate-y-full gap-2 bg-white/95 p-3 backdrop-blur-sm transition-transform duration-500 ease-out group-hover:translate-y-0">
                      <button
                        onClick={() => add(product)}
                        className="flex flex-1 items-center justify-center gap-2 bg-secondary py-2.5 text-[11px] font-semibold tracking-[1.5px] text-secondary-foreground transition-colors hover:bg-primary">
                        <ShoppingBag size={14} strokeWidth={2} />
                        ADD
                      </button>
                      <Link
                        href="/notebooks"
                        aria-label={"View " + product.name}
                        className="flex w-11 items-center justify-center border border-line text-ink transition-colors hover:border-primary hover:text-primary"
                      >
                        <Eye size={16} strokeWidth={1.8} />
                      </Link>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
                      {product.type}
                    </p>
                    <h3 className="mt-1.5 text-[17px] font-bold tracking-[0.3px] text-ink transition-colors group-hover:text-primary">
                      {product.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 min-h-[42px] text-[13px] italic leading-[21px] text-muted">
                      {product.quote ? `“${product.quote}”` : ""}
                    </p>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-[17px] font-bold text-primary">
                        {formatINR(product.price)}
                      </span>
                      {product.mrp > product.price && (
                        <span className="text-[13px] text-muted line-through">
                          {formatINR(product.mrp)}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-12 text-center">
          <Link
            href="/notebooks"
            className="inline-block border-2 border-secondary px-10 py-3.5 text-[12px] font-semibold tracking-[2px] text-ink transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            VIEW ALL NOTE BOOKS
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
