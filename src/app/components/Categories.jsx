import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategoriesSafe } from "@/lib/services/categoryService";
import Reveal from "./Reveal";
import CategoryGrid from "./CategoryGrid";

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

      <CategoryGrid categories={categories} />
    </section>
  );
}
