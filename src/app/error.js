"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import PageHeader from "./components/PageHeader";

/**
 * Site-wide fallback for anything a page throws while rendering — almost
 * always a fetch to the backend that failed (a network blip, or Render's
 * free tier waking back up after being idle, which can take the first
 * request past its timeout). This is the last resort: it replaces the
 * whole page, so it renders its own header rather than relying on
 * whatever the page itself would have shown alongside its content.
 *
 * Error boundaries must be Client Components — Next renders this in place
 * of the route segment that threw.
 */
export default function Error({ error, retry }) {
  return (
    <>
      <PageHeader title="Something went wrong" crumb="ERROR" />
      <div className="mx-auto flex max-w-[560px] flex-col items-center px-6 py-20 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface">
          <AlertTriangle size={30} strokeWidth={1.4} className="text-primary" />
        </span>
        <h2 className="mt-6 text-xl font-bold uppercase tracking-[0.5px] text-ink">
          We couldn&rsquo;t load this page
        </h2>
        <p className="mt-3 leading-8 text-muted">
          This is usually the connection to our server, not something wrong
          with your account or order. Please try again in a moment.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => retry()}
            className="bg-primary px-10 py-4 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            TRY AGAIN
          </button>
          <Link
            href="/"
            className="border-2 border-secondary px-8 py-3.5 text-[12px] font-semibold tracking-[2px] text-ink transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            BACK TO HOME
          </Link>
        </div>

        {/* Not shown to point blame at anything — just something to quote if
            they end up contacting support about it. */}
        {error?.digest && (
          <p className="mt-8 text-[11px] text-muted">Reference: {error.digest}</p>
        )}
      </div>
    </>
  );
}
