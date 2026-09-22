// ---------------------------------------------------------------------------
// API configuration
//
// The Express backend lives in its own repo/process. Point the frontend at it
// with NEXT_PUBLIC_API_URL (see .env.example). It has to be a
// NEXT_PUBLIC_* variable because client components (search overlay, product
// browser) refetch categories from the browser.
// ---------------------------------------------------------------------------

const DEFAULT_BASE_URL = "https://stationery-backend-m4xs.onrender.com/api";

/** Base URL of the backend, always without a trailing slash. */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || DEFAULT_BASE_URL
).replace(/\/+$/, "");

/**
 * Abort a request that the backend has not answered within this many ms.
 *
 * 30s, not the more typical 10-15s: Render's free tier spins the backend down
 * after it sits idle, and waking it back up for the next request can itself
 * take most of that time. A shorter timeout was aborting cold-start requests
 * that would have gone through fine a few seconds later, particularly the
 * first page load after the server had been idle for a while.
 */
export const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000;

/**
 * How long a cached server-side GET stays fresh, in seconds.
 *
 * 0 (the default) means never cache — every page render asks the backend, so a
 * category added or activated in the admin shows up on the next reload. Set
 * NEXT_PUBLIC_CATEGORY_REVALIDATE to a number of seconds in production if you
 * would rather trade freshness for speed.
 */
export const CATEGORY_REVALIDATE =
  Number(process.env.NEXT_PUBLIC_CATEGORY_REVALIDATE) || 0;
