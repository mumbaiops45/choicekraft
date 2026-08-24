import Link from "next/link";

/**
 * Textured band behind the floating navbar, then the title block.
 * The banner is anchored to its top edge — that strip of the artwork is plain
 * chalkboard, so none of the baked-in banner text shows through.
 */
export default function PageHeader({ title, crumb }) {
  return (
    <section>
      <div className="relative h-[110px] overflow-hidden bg-ink md:h-[150px] lg:h-[190px]">
        <img
          src="/images/main-banner-2.jpg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-top"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-ink/35"
        />
      </div>

      <div className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1510px] px-6 py-10 text-center lg:py-12">
          <nav
            aria-label="Breadcrumb"
            className="text-[13px] tracking-[1px] text-muted"
          >
            <Link href="/" className="transition-colors hover:text-primary">
              HOME
            </Link>
            <span className="px-2 text-line-strong">/</span>
            <span className="text-primary">{crumb || title}</span>
          </nav>

          <h1 className="mt-4 text-3xl font-bold uppercase tracking-[0.5px] text-ink lg:text-[40px]">
            {title}
          </h1>
        </div>
      </div>
    </section>
  );
}
