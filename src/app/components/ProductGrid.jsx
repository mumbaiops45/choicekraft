export default function ProductGrid({ items }) {
  return (
    <div className="mx-auto grid max-w-[1510px] grid-cols-1 gap-8 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.name}
          className="group border border-line bg-white transition-shadow hover:shadow-[0_12px_30px_rgba(0,0,0,0.10)]"
        >
          <div className="flex h-[220px] items-center justify-center bg-surface-alt">
            <span className="text-[13px] tracking-[2px] text-muted">
              {item.name.toUpperCase()}
            </span>
          </div>

          <div className="p-5 text-center">
            <h3 className="text-[15px] font-semibold tracking-[1px] text-ink transition-colors group-hover:text-primary">
              {item.name}
            </h3>
            <p className="mt-2 text-[15px] font-bold text-primary">{item.price}</p>

            <button className="mt-4 w-full bg-secondary py-3 text-[12px] font-semibold tracking-[2px] text-secondary-foreground transition-colors hover:bg-primary">
              ADD TO CART
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
