/**
 * Skeleton primitives shared by every loading.js and client "still fetching"
 * state — so a page's placeholder and its real content are built from the
 * same rhythm instead of each screen inventing its own loading look.
 *
 * Pure decoration (aria-hidden): the page around a skeleton carries its own
 * "Loading…" text for screen readers.
 */

// No rounding by default — the site's cards, buttons and panels are all
// square-cornered, and a skeleton should read as a stand-in for them.
const base = "animate-pulse bg-line";

/** A line of placeholder text. Slightly rounded, like a line of type. */
export function Bar({ className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`${base} block rounded-[2px] ${className}`}
    />
  );
}

/** A placeholder for an image, card or panel — square corners, no rounding. */
export function Block({ className = "" }) {
  return <div aria-hidden="true" className={`${base} ${className}`} />;
}

/** Same fixed height as the real PageHeader banner + title band, so content
    swapping in doesn't shift the page. Title width hints at how long the real
    title usually runs (a product name vs. a short page name). */
export function PageHeaderSkeleton({ titleWidth = "w-64" }) {
  return (
    <section aria-hidden="true">
      <div className="relative h-[110px] animate-pulse bg-ink/10 md:h-[150px] lg:h-[190px]" />
      <div className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1510px] px-6 py-10 text-center lg:py-12">
          <Bar className="mx-auto h-3 w-24" />
          <Bar className={`mx-auto mt-4 h-8 lg:h-10 ${titleWidth}`} />
        </div>
      </div>
    </section>
  );
}

/** One ProductCard-shaped placeholder. */
export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col border border-line bg-white">
      <Block className="aspect-[4/5] w-full" />
      <div className="flex flex-1 flex-col p-5">
        <Bar className="h-3 w-16" />
        <Bar className="mt-2.5 h-4 w-full" />
        <Bar className="mt-1.5 h-4 w-2/3" />
        <Bar className="mt-3 h-5 w-20" />
        <Block className="mt-5 h-11 w-full" />
      </div>
    </div>
  );
}

/** A product listing page: the ProductBrowser toolbar + a grid of cards. */
export function ProductGridSkeleton({ count = 9 }) {
  return (
    <div className="mx-auto max-w-[1510px] px-6 py-14" aria-hidden="true">
      <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-12">
        <aside className="hidden lg:block lg:space-y-6">
          <Bar className="h-4 w-20" />
          <Block className="h-40 w-full" />
          <Bar className="h-4 w-24" />
          <Block className="h-28 w-full" />
        </aside>

        <div>
          <Block className="h-[58px] w-full" />
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The product detail page: image + copy, side by side once there's room. */
export function ProductDetailSkeleton() {
  return (
    <section className="mx-auto max-w-[1510px] px-6 py-16" aria-hidden="true">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <Block className="mx-auto aspect-square w-full max-w-[520px]" />
        <div>
          <Bar className="h-3 w-28" />
          <Bar className="mt-3 h-8 w-3/4" />
          <Bar className="mt-2 h-8 w-1/2" />
          <Bar className="mt-5 h-6 w-32" />
          <div className="mt-8 space-y-3">
            <Bar className="h-4 w-full" />
            <Bar className="h-4 w-full" />
            <Bar className="h-4 w-2/3" />
          </div>
          <div className="mt-8 flex gap-3">
            <Block className="h-14 flex-1" />
            <Block className="h-14 flex-1" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Long-form copy: FAQ / policy / about pages. */
export function TextPageSkeleton({ withSidebar = true }) {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-16" aria-hidden="true">
      <div className={withSidebar ? "grid gap-12 lg:grid-cols-[220px_1fr]" : ""}>
        {withSidebar && (
          <aside className="hidden space-y-2 lg:block">
            {Array.from({ length: 4 }).map((_, i) => (
              <Bar key={i} className="h-9 w-full" />
            ))}
          </aside>
        )}
        <div className="space-y-4">
          <Bar className="h-6 w-1/2" />
          <Bar className="h-4 w-full" />
          <Bar className="h-4 w-full" />
          <Bar className="h-4 w-5/6" />
          <Bar className="mt-8 h-6 w-1/3" />
          <Bar className="h-4 w-full" />
          <Bar className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

/** A handful of order rows, matching /orders' card list. */
export function OrderListSkeleton({ count = 4 }) {
  return (
    <div className="mx-auto max-w-[1000px] px-6 py-14" aria-hidden="true">
      <ul className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <li
            key={i}
            className="flex flex-wrap items-center gap-4 border border-line bg-white p-5"
          >
            <div className="min-w-0 flex-1">
              <Bar className="h-4 w-40" />
              <Bar className="mt-2.5 h-3 w-56" />
            </div>
            <Bar className="h-5 w-16" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One order's full detail: status card, items, address and payment panels. */
export function OrderDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1000px] px-6 py-14" aria-hidden="true">
      <Bar className="h-3 w-24" />
      <Block className="mt-6 h-32 w-full" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Block key={i} className="h-20 w-full" />
          ))}
        </div>
        <div className="space-y-4">
          <Block className="h-32 w-full" />
          <Block className="h-28 w-full" />
        </div>
      </div>
    </div>
  );
}

/** Priced list + summary panel: the checkout page before its data arrives. */
export function CheckoutSkeleton() {
  return (
    <div className="mx-auto max-w-[1510px] px-6 py-14" aria-hidden="true">
      <Bar className="h-4 w-40" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
        <div className="space-y-4">
          <Block className="h-24 w-full" />
          <Block className="h-24 w-full" />
        </div>
        <Block className="h-72 w-full" />
      </div>
    </div>
  );
}
