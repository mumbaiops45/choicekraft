import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { getCategoriesSafe } from "@/lib/services/categoryService";
import Reveal from "./Reveal";

export default async function Categories() {
  const categories = await getCategoriesSafe();

  // Nothing to show (empty catalogue, or the API is down) — drop the whole
  // section rather than leaving a heading over an empty grid.
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1510px] px-6 py-20 lg:py-28">
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold uppercase leading-[1.2] tracking-[0.5px] text-ink lg:text-[40px]">
            Shop by <span className="text-primary">category</span>
          </h2>
        </div>

        <Link
          href="/products"
          className="group inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[2px] text-ink transition-colors hover:text-primary"
        >
          View all products
          <ArrowRight
            size={15}
            strokeWidth={2.2}
            className="transition-transform duration-300 group-hover:translate-x-1.5"
          />
        </Link>
      </Reveal>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:gap-6">
        {categories.map((category, i) => (
          <Reveal key={category.slug} delay={(i % 4) * 70}>
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

              <div className="flex flex-1 flex-col p-4 lg:p-5">
                <h3 className="text-[14px] font-bold uppercase tracking-[0.8px] text-ink transition-colors group-hover:text-primary lg:text-[15px]">
                  {category.name}
                </h3>
                {category.tagline && (
                  <p className="mt-1.5 text-[12px] leading-5 text-muted">
                    {category.tagline}
                  </p>
                )}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
