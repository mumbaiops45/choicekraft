"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCategories } from "@/lib/services/categoryService";

/**
 * Categories for client components.
 *
 * Pass `initialData` (categories already fetched on the server) to render with
 * real data on the very first paint — the hook then only refetches when you
 * call `refetch()`.
 *
 * @param {object}   [options]
 * @param {object[]} [options.initialData] server-rendered categories
 * @param {boolean}  [options.enabled]     fetch on mount, defaults to true
 *                                         when there is no initialData
 * @returns {{ categories: object[], loading: boolean, error: string|null,
 *             refetch: () => Promise<void> }}
 */
export default function useCategories(options = {}) {
  const { initialData = [], enabled = initialData.length === 0 } = options;

  const [categories, setCategories] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  // Lets an unmount — or a second refetch — cancel the request in flight.
  const abortRef = useRef(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      // Browser calls skip the server cache: always ask for the live list.
      const data = await getCategories({
        cache: "no-store",
        signal: controller.signal,
      });
      if (!controller.signal.aborted) setCategories(data);
    } catch (err) {
      if (controller.signal.aborted || err?.name === "AbortError") return;
      setError(err?.message || "Could not load categories.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    load();
    return () => abortRef.current?.abort();
  }, [enabled, load]);

  return { categories, loading, error, refetch: load };
}

export { useCategories };
