"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getShippingSettings } from "@/lib/services/settingService";

const FALLBACK = { shippingCharge: 50, freeShippingThreshold: 500 };

/**
 * Shipping settings for client components.
 *
 * Pass `initialData` (fetched on the server) to render with real numbers on
 * the very first paint — the hook then only refetches when you call
 * `refetch()`.
 *
 * @param {object}  [options]
 * @param {object}  [options.initialData] server-fetched { shippingCharge, freeShippingThreshold }
 * @param {boolean} [options.enabled]     fetch on mount, defaults to true when there is no initialData
 */
export default function useShippingSettings(options = {}) {
  const { initialData = null, enabled = initialData === null } = options;

  const [shipping, setShipping] = useState(initialData || FALLBACK);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await getShippingSettings({
        cache: "no-store",
        signal: controller.signal,
      });
      if (!controller.signal.aborted) setShipping(data);
    } catch (err) {
      if (controller.signal.aborted || err?.name === "AbortError") return;
      setError(err?.message || "Could not load shipping settings.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    load();
    return () => abortRef.current?.abort();
  }, [enabled, load]);

  return { shipping, loading, error, refetch: load };
}

export { useShippingSettings };
