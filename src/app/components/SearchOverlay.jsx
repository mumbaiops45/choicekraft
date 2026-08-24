"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, CornerDownLeft } from "lucide-react";
import { allProducts, formatINR } from "../data/products";
import { categories } from "../data/categories";

const MAX_RESULTS = 8;

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);

    // Focus the field once the panel has finished sliding in
    const t = setTimeout(() => inputRef.current?.focus(), 120);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  const term = query.trim().toLowerCase();

  const { products, cats } = useMemo(() => {
    if (term.length < 2) return { products: [], cats: [] };

    const scored = allProducts
      .map((p) => {
        const name = p.name.toLowerCase();
        const type = (p.type || "").toLowerCase();
        const cat = p.category.replace(/-/g, " ");
        let score = 0;
        if (name.startsWith(term)) score = 4;
        else if (name.includes(term)) score = 3;
        else if (type.includes(term)) score = 2;
        else if (cat.includes(term)) score = 1;
        return { p, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);

    return {
      products: scored.slice(0, MAX_RESULTS).map((r) => r.p),
      cats: categories
        .filter((c) => c.name.toLowerCase().includes(term))
        .slice(0, 4),
    };
  }, [term]);

  const close = () => {
    setQuery("");
    onClose();
  };

  return (
    <div
      className={"fixed inset-0 z-[70] " + (open ? "" : "pointer-events-none")}
      aria-hidden={!open}
    >
      <button
        aria-label="Close search"
        tabIndex={open ? 0 : -1}
        onClick={close}
        className={
          "absolute inset-0 bg-ink/70 transition-opacity duration-300 " +
          (open ? "opacity-100" : "opacity-0")
        }
      />

      <div
        role="dialog"
        aria-label="Search products"
        className={
          "absolute inset-x-0 top-0 bg-white transition-transform duration-300 ease-out " +
          (open ? "translate-y-0" : "-translate-y-full")
        }
      >
        <div className="mx-auto max-w-[860px] px-6 py-8 lg:py-12">
          <div className="flex items-center gap-4 border-b-2 border-ink pb-4">
            <Search size={22} strokeWidth={2} className="shrink-0 text-primary" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search note books, pens, files…"
              aria-label="Search products"
              tabIndex={open ? 0 : -1}
              className="min-w-0 flex-1 bg-transparent text-[18px] text-ink outline-none placeholder:text-muted lg:text-[22px]"
            />
            <button
              onClick={close}
              aria-label="Close search"
              tabIndex={open ? 0 : -1}
              className="flex h-10 w-10 shrink-0 items-center justify-center border border-line text-ink transition-colors hover:border-primary hover:text-primary"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {term.length < 2 ? (
              <div className="py-8">
                <p className="text-[13px] font-semibold uppercase tracking-[2px] text-muted">
                  Popular categories
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {categories.slice(0, 8).map((c) => (
                    <Link
                      key={c.slug}
                      href={c.href}
                      onClick={close}
                      tabIndex={open ? 0 : -1}
                      className="border border-line px-4 py-2 text-[13px] text-ink-soft transition-colors hover:border-primary hover:text-primary"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : products.length === 0 && cats.length === 0 ? (
              <p className="py-10 text-center leading-8 text-muted">
                Nothing matches &ldquo;{query}&rdquo;. Try a product name, a
                brand, or a category.
              </p>
            ) : (
              <div className="py-6">
                {cats.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[13px] font-semibold uppercase tracking-[2px] text-muted">
                      Categories
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2.5">
                      {cats.map((c) => (
                        <Link
                          key={c.slug}
                          href={c.href}
                          onClick={close}
                          tabIndex={open ? 0 : -1}
                          className="border border-line px-4 py-2 text-[13px] text-ink-soft transition-colors hover:border-primary hover:text-primary"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {products.length > 0 && (
                  <>
                    <p className="text-[13px] font-semibold uppercase tracking-[2px] text-muted">
                      Products
                    </p>
                    <ul className="mt-3 divide-y divide-line">
                      {products.map((p) => (
                        <li key={p.slug}>
                          <Link
                            href={
                              p.kind === "book"
                                ? "/notebooks"
                                : "/category/" + p.category
                            }
                            onClick={close}
                            tabIndex={open ? 0 : -1}
                            className="group flex items-center gap-4 py-3.5"
                          >
                            <div className="h-[58px] w-[50px] shrink-0 overflow-hidden bg-surface">
                              <img
                                src={p.image}
                                alt=""
                                className={
                                  "h-full w-full " +
                                  (p.kind === "book"
                                    ? "object-cover"
                                    : "object-contain p-1")
                                }
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[14px] font-semibold text-ink transition-colors group-hover:text-primary">
                                {p.name}
                              </p>
                              <p className="text-[12px] text-muted">{p.type}</p>
                            </div>
                            <span className="shrink-0 text-[14px] font-bold text-primary">
                              {formatINR(p.price)}
                            </span>
                            <CornerDownLeft
                              size={15}
                              className="shrink-0 text-line-strong transition-colors group-hover:text-primary"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
