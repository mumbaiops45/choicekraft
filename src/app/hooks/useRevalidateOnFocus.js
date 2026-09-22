"use client";

import { useEffect, useRef } from "react";

// Coming back inside this window of the last refetch is almost always the
// same "came back" event firing twice (a tab regaining focus fires both
// visibilitychange and focus) rather than two separate returns to the tab.
const THROTTLE_MS = 8000;

/**
 * Re-runs `onFocus` when this tab is switched back to or the browser window
 * regains focus — so data that changed elsewhere (another tab, another
 * device, an order's status moving on) shows up on its own instead of
 * needing a manual page reload.
 *
 * Deliberately not a poll: nothing refetches while the tab is just sitting
 * open and unwatched, so this costs nothing beyond an actual return visit.
 *
 * @param {() => void} onFocus   called with no arguments; ignore its result
 * @param {boolean} [enabled]    e.g. only while signed in — pass false to
 *                                skip attaching the listeners entirely
 */
export default function useRevalidateOnFocus(onFocus, enabled = true) {
  const savedCallback = useRef(onFocus);
  const lastRun = useRef(0);

  useEffect(() => {
    savedCallback.current = onFocus;
  }, [onFocus]);

  useEffect(() => {
    if (!enabled) return;

    const run = () => {
      const now = Date.now();
      if (now - lastRun.current < THROTTLE_MS) return;
      lastRun.current = now;
      savedCallback.current();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") run();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", run);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", run);
    };
  }, [enabled]);
}
