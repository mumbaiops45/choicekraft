"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getGiftSettings } from "@/lib/services/settingService";

const FALLBACK = { freeGiftThreshold: 500, freeGiftProduct: null };

/**
 * Free-gift settings for client components — same pattern as
 * useShippingSettings: pass `initialData` fetched on the server to render
 * with real numbers on the very first paint.
 *
 * @param {object}  [options]
 * @param {object}  [options.initialData] server-fetched { freeGiftThreshold, freeGiftProduct }
 * @param {boolean} [options.enabled]     fetch on mount, defaults to true when there is no initialData
 */
export default function useGiftSettings(options = {}) {
  const { initialData = null, enabled = initialData === null } = options;

  const [gift, setGift] = useState(initialData || FALLBACK);
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
      const data = await getGiftSettings({
        cache: "no-store",
        signal: controller.signal,
      });
      if (!controller.signal.aborted) setGift(data);
    } catch (err) {
      if (controller.signal.aborted || err?.name === "AbortError") return;
      setError(err?.message || "Could not load gift settings.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    load();
    return () => abortRef.current?.abort();
  }, [enabled, load]);

  return { gift, loading, error, refetch: load };
}

export { useGiftSettings };
