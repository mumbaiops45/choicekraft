"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import { categories } from "../data/categories";
import { formatINR } from "../data/products";
import ProductCard from "./ProductCard";
import { useCart } from "../context/CartContext";
import Reveal from "./Reveal";

const priceBands = [
  { id: "u100", label: "Under ₹100", test: (p) => p.price < 100 },
  { id: "100-300", label: "₹100 – ₹300", test: (p) => p.price >= 100 && p.price < 300 },
  { id: "300-800", label: "₹300 – ₹800", test: (p) => p.price >= 300 && p.price < 800 },
  { id: "o800", label: "Over ₹800", test: (p) => p.price >= 800 },
];

const kinds = [
  { id: "book", label: "Note Books" },
  { id: "stationery", label: "Stationery" },
];

const sorts = [
  { id: "default", label: "Default" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "name", label: "Name: A to Z" },
  { id: "discount", label: "Biggest Discount" },
];

const pageSizes = [12, 24, 48, 96];

const discountOf = (p) =>
  p.mrp ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;

export default function ProductBrowser({ products, activeCategory }) {
  const { add } = useCart();
  const [bands, setBands] = useState([]);
  const [kindFilter, setKindFilter] = useState([]);
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [sort, setSort] = useState("default");
  // Default high enough to show the whole catalogue; the selector narrows it.
  const [show, setShow] = useState(96);
  const [view, setView] = useState("grid");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggle = (list, setList, id) =>
    setList(list.includes(id) ? list.filter((v) => v !== id) : [...list, id]);

  const filtered = useMemo(() => {
    let out = products;

    if (bands.length) {
      out = out.filter((p) =>
        bands.some((id) => priceBands.find((b) => b.id === id)?.test(p))
      );
    }
    if (kindFilter.length) out = out.filter((p) => kindFilter.includes(p.kind));
    if (onlyOffers) out = out.filter((p) => discountOf(p) > 0);

    const sorted = [...out];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "discount") sorted.sort((a, b) => discountOf(b) - discountOf(a));

    return sorted;
  }, [products, bands, kindFilter, onlyOffers, sort]);

  const visible = filtered.slice(0, show);
  const activeCount = bands.length + kindFilter.length + (onlyOffers ? 1 : 0);

  const clearAll = () => {
    setBands([]);
    setKindFilter([]);
    setOnlyOffers(false);
  };

  const sidebar = (
    <div className="space-y-8">
      {/* Categories */}
      <div className="border border-line bg-white p-6">
        <h2 className="text-[14px] font-bold uppercase tracking-[1.5px] text-ink">
          Categories
        </h2>
        <span className="mt-3 block h-[2px] w-9 bg-primary" />

        <ul className="mt-5 space-y-2.5">
          {categories.map((category) => {
            const active = category.slug === activeCategory;
            return (
              <li key={category.slug}>
                <Link
                  href={category.href}
                  className={
                    "block text-[14px] transition-colors " +
                    (active
                      ? "font-semibold text-primary"
                      : "text-ink-soft hover:text-primary")
                  }
                >
                  {category.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Refine */}
      <div className="border border-line bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-bold uppercase tracking-[1.5px] text-ink">
            Refine Search
          </h2>
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="text-[12px] font-medium text-primary hover:underline"
            >
              Clear ({activeCount})
            </button>
          )}
        </div>
        <span className="mt-3 block h-[2px] w-9 bg-primary" />

        <fieldset className="mt-6">
          <legend className="text-[13px] font-bold text-ink">Price</legend>
          <div className="mt-3 space-y-2.5">
            {priceBands.map((band) => (
              <label
                key={band.id}
                className="flex cursor-pointer items-center gap-2.5 text-[14px] text-ink-soft transition-colors hover:text-primary"
              >
                <input
                  type="checkbox"
                  checked={bands.includes(band.id)}
                  onChange={() => toggle(bands, setBands, band.id)}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                {band.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-7">
          <legend className="text-[13px] font-bold text-ink">Product type</legend>
          <div className="mt-3 space-y-2.5">
            {kinds.map((kind) => (
              <label
                key={kind.id}
                className="flex cursor-pointer items-center gap-2.5 text-[14px] text-ink-soft transition-colors hover:text-primary"
              >
                <input
                  type="checkbox"
                  checked={kindFilter.includes(kind.id)}
                  onChange={() => toggle(kindFilter, setKindFilter, kind.id)}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                {kind.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-7">
          <legend className="text-[13px] font-bold text-ink">Offers</legend>
          <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-[14px] text-ink-soft transition-colors hover:text-primary">
            <input
              type="checkbox"
              checked={onlyOffers}
              onChange={() => setOnlyOffers(!onlyOffers)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            On offer only
          </label>
        </fieldset>

        <p className="mt-7 border-t border-line pt-5 text-[13px] text-muted">
          Showing{" "}
          <span className="font-semibold text-ink">{visible.length}</span> of{" "}
          <span className="font-semibold text-ink">{filtered.length}</span>{" "}
          products
        </p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1510px] px-6 py-14">
      <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-12">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">{sidebar}</aside>

        <div>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border border-line bg-white px-5 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-2 border border-line px-4 py-2 text-[12px] font-semibold tracking-[1px] text-ink transition-colors hover:border-primary hover:text-primary lg:hidden"
              >
                <SlidersHorizontal size={15} strokeWidth={2} />
                FILTERS
                {activeCount > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                    {activeCount}
                  </span>
                )}
              </button>

              <div className="hidden gap-1.5 sm:flex">
                <button
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                  className={
                    "flex h-9 w-9 items-center justify-center border transition-colors " +
                    (view === "grid"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-line text-muted hover:border-primary hover:text-primary")
                  }
                >
                  <LayoutGrid size={16} strokeWidth={2} />
                </button>
                <button
                  onClick={() => setView("list")}
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  className={
                    "flex h-9 w-9 items-center justify-center border transition-colors " +
                    (view === "list"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-line text-muted hover:border-primary hover:text-primary")
                  }
                >
                  <List size={16} strokeWidth={2} />
                </button>
              </div>

              <p className="text-[13px] text-muted">
                {filtered.length} product{filtered.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-[13px] text-muted">
                Sort By
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="border border-line bg-white px-3 py-2 text-[13px] text-ink outline-none transition-colors focus:border-primary"
                >
                  {sorts.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 text-[13px] text-muted">
                Show
                <select
                  value={show}
                  onChange={(e) => setShow(Number(e.target.value))}
                  className="border border-line bg-white px-3 py-2 text-[13px] text-ink outline-none transition-colors focus:border-primary"
                >
                  {pageSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Results */}
          {visible.length === 0 ? (
            <div className="mt-10 border border-line bg-surface px-6 py-20 text-center">
              <p className="text-[17px] font-semibold text-ink">
                No products match these filters
              </p>
              <button
                onClick={clearAll}
                className="mt-5 bg-primary px-7 py-3 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                CLEAR FILTERS
              </button>
            </div>
          ) : view === "grid" ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {visible.map((product, i) => (
                <Reveal key={product.slug} delay={(i % 3) * 70}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {visible.map((product, i) => (
                <Reveal key={product.slug} delay={(i % 4) * 50}>
                  <article className="group flex flex-col gap-6 border border-line bg-white p-5 transition-shadow hover:shadow-[0_14px_34px_rgba(0,0,0,0.10)] sm:flex-row">
                    <div className="w-full shrink-0 overflow-hidden bg-white sm:w-[190px]">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className={
                          "h-full w-full transition-transform duration-700 group-hover:scale-105 " +
                          (product.kind === "book"
                            ? "aspect-[707/1000] object-cover"
                            : "aspect-square object-contain p-3")
                        }
                      />
                    </div>

                    <div className="flex flex-1 flex-col">
                      <p className="text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
                        {product.type}
                      </p>
                      <h3 className="mt-1.5 text-[19px] font-bold text-ink transition-colors group-hover:text-primary">
                        {product.name}
                      </h3>
                      {product.quote && (
                        <p className="mt-2 text-[13px] italic leading-6 text-muted">
                          &ldquo;{product.quote}&rdquo;
                        </p>
                      )}

                      <div className="mt-4 flex items-baseline gap-3">
                        <span className="text-[20px] font-bold text-primary">
                          {formatINR(product.price)}
                        </span>
                        {product.mrp > product.price && (
                          <span className="text-[14px] text-muted line-through">
                            {formatINR(product.mrp)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => add(product)}
                        className="mt-5 w-full bg-secondary py-3 text-[12px] font-semibold tracking-[2px] text-secondary-foreground transition-colors hover:bg-primary sm:w-[190px]">
                        ADD TO CART
                      </button>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}

          {visible.length < filtered.length && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setShow(show + 24)}
                className="border-2 border-secondary px-10 py-3.5 text-[12px] font-semibold tracking-[2px] text-ink transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                LOAD MORE
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            aria-label="Close filters"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-ink/60"
          />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-[340px] overflow-y-auto bg-surface p-5">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-[14px] font-bold uppercase tracking-[1.5px] text-ink">
                Filters
              </p>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
                className="flex h-9 w-9 items-center justify-center border border-line text-ink"
              >
                <X size={17} strokeWidth={2} />
              </button>
            </div>
            {sidebar}
          </div>
        </div>
      )}
    </div>
  );
}
