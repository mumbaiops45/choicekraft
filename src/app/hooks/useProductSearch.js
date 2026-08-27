"use client";

import { useEffect, useRef, useState } from "react";
import { getProducts } from "@/lib/services/productService";

/** Wait this long after the last keystroke before asking the backend. */
const DEBOUNCE_MS = 250;

/**
 * The backend matches substrings without ranking, so a search for "pen" can
 * return "Tape Dispenser" and "Sharpener" above the actual pens. This is the
 * ranking the overlay used before the catalogue moved server-side: a name that
 * starts with the term beats one that merely contains it, which beats a match
 * on the type label or the category.
 */
const relevance = (product, term) => {
  const name = (product.name || "").toLowerCase();
  const type = (product.type || "").toLowerCase();
  const category = (product.category || "").replace(/-/g, " ");

  if (name.startsWith(term)) return 4;
  if (name.includes(term)) return 3;
  if (type.includes(term)) return 2;
  if (category.includes(term)) return 1;
  return 0;
};

/** Stable sort: equal scores keep the order the backend sent them in. */
const byRelevance = (products, term) =>
  products
    .map((product, index) => ({ product, index, score: relevance(product, term) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.product);

/**
 * Server-side product search for the search overlay.
 *
 * The catalogue is far too large to ship to the browser just to filter it, so
 * the backend's own `search` does the work and only matches come back.
 *
 * @param {string} term    the raw query
 * @param {object} [options]
 * @param {number} [options.limit]    max results, defaults to 8
 * @param {number} [options.minChars] query length before searching, defaults 2
 * @returns {{ products: object[], loading: boolean, error: string|null }}
 */
export default function useProductSearch(term, options = {}) {
  const { limit = 8, minChars = 2 } = options;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);

  useEffect(() => {
    const query = (term || "").trim();

    if (query.length < minChars) {
      abortRef.current?.abort();
      setProducts([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const { products: found } = await getProducts(
          { search: query, limit },
          { cache: "no-store", signal: controller.signal }
        );
        if (!controller.signal.aborted) {
          setProducts(byRelevance(found, query.toLowerCase()));
          setError(null);
        }
      } catch (err) {
        if (controller.signal.aborted || err?.name === "AbortError") return;
        setProducts([]);
        setError(err?.message || "Search is unavailable right now.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [term, limit, minChars]);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { products, loading, error };
}

export { useProductSearch };
