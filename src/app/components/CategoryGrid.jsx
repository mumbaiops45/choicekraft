"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Package } from "lucide-react";
import Reveal from "./Reveal";

// Three rows at each breakpoint's column count (2 / 3 / 4 columns).
const ROWS_MOBILE = 6;
const ROWS_TABLET = 9;
const ROWS_DESKTOP = 12;

/**
 * Collapsed, a card past the third row of the current layout is hidden with
 * CSS rather than sliced off in JS, so the cut is right at every screen width
 * without measuring anything.
 */
const collapsedClass = (i) => {
  if (i >= ROWS_DESKTOP) return "hidden";
  if (i >= ROWS_TABLET) return "hidden md:block";
  if (i >= ROWS_MOBILE) return "hidden sm:block";
  return "";
};

// The button only appears where something is actually hidden.
const buttonClass = (count) => {
  if (count > ROWS_DESKTOP) return "flex";
  if (count > ROWS_TABLET) return "flex md:hidden";
  if (count > ROWS_MOBILE) return "flex sm:hidden";
  return "hidden";
};

export default function CategoryGrid({ categories }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div
        id="category-grid"
        className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:gap-6"
      >
        {categories.map((category, i) => (
          <Reveal
            key={category.slug}
            delay={(i % 4) * 70}
            className={expanded ? "" : collapsedClass(i)}
          >
            <Link
              href={category.href}
              className="group flex h-full flex-col border border-line bg-white transition-all duration-500 hover:-translate-y-1.5 hover:border-transparent hover:shadow-[0_18px_40px_rgba(0,0,0,0.12)]"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-white">
                {category.image ? (
                  // object-contain: these photos arrive at every ratio, and
                  // cover was slicing 20-35% off the wider/taller ones.
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                    className="h-full w-full object-fill p-4 transition-transform duration-700 ease-out group-hover:scale-[1.07] lg:p-6"
                  />
                ) : (
                  <span
                    className="flex h-full w-full items-center justify-center transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                    style={{ backgroundColor: category.tint + "1a" }}
                  >
                    <Package
                      size={54}
                      strokeWidth={1.3}
                      style={{ color: category.tint }}
                    />
                  </span>
                )}

                {/* Pink wipe on hover */}
                <span className="absolute inset-x-0 bottom-0 h-[4px] w-0 bg-primary transition-all duration-500 ease-out group-hover:w-full" />
              </div>

              <div className="flex flex-1 flex-col items-center justify-center p-4 text-center lg:p-5">
                <h3 className="text-[14px] font-bold uppercase tracking-[0.8px] text-ink transition-colors group-hover:text-primary lg:text-[15px]">
                  {category.name}
                </h3>

                {/* Visual affordance only — the whole card is already the
                    link, so this is not its own interactive element. */}
                <span
                  aria-hidden="true"
                  className="mt-4 inline-flex items-center gap-1.5 border border-primary bg-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-[1.5px] text-primary-foreground transition-colors duration-300 group-hover:border-secondary group-hover:bg-secondary group-hover:text-secondary-foreground"
                >
                  Shop Now
                  <ArrowRight
                    size={13}
                    strokeWidth={2.2}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <div
        className={"mt-10 justify-center " + buttonClass(categories.length)}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="category-grid"
          className="group inline-flex items-center gap-2 border-2 border-secondary px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[2px] text-ink transition-colors hover:bg-secondary hover:text-secondary-foreground"
        >
          {expanded ? "Show fewer categories" : "View all categories"}
          <ChevronDown
            size={16}
            strokeWidth={2.2}
            className={
              "transition-transform duration-300 " +
              (expanded ? "rotate-180" : "")
            }
          />
        </button>
      </div>
    </>
  );
}
