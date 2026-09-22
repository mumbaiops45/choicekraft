"use client";

import { useEffect, useState } from "react";

/**
 * True once `loading` has stayed true for longer than `delayMs`.
 *
 * A skeleton alone looks identical whether a fetch is about to finish or has
 * stalled — nothing on screen changes, so several extra seconds of a slow
 * backend (Render's free tier waking back up from idle, in particular) reads
 * as "this is broken" rather than "this is still working". Pair this with a
 * small note so a load that is merely slow says so, instead of just sitting
 * there. A fast load never shows it: the timer is cancelled the moment
 * `loading` goes false.
 *
 * @param {boolean} loading
 * @param {number} [delayMs]
 */
export default function useSlowLoadHint(loading, delayMs = 4000) {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    if (!loading) return undefined;

    const timer = setTimeout(() => setElapsed(true), delayMs);
    return () => {
      clearTimeout(timer);
      // Reset lives in cleanup, not the effect body: it only needs to run
      // when this effect is torn down (loading ended, or the delay changed),
      // which is exactly the moment `elapsed` should stop applying.
      setElapsed(false);
    };
  }, [loading, delayMs]);

  // Gated on `loading` too, so a stale `true` can never outlive it even for
  // the one render between loading flipping false and cleanup running.
  return loading && elapsed;
}
