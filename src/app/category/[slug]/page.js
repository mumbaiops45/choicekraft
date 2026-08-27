import { notFound } from "next/navigation";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Reveal from "../../components/Reveal";
import ProductBrowser from "../../components/ProductBrowser";
import {
  getCategoriesSafe,
  getCategoryBySlug,
} from "@/lib/services/categoryService";
import { getProductsByCategory } from "@/lib/services/productService";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  return {
    title: category
      ? category.name + " | ChoiceKraft"
      : "Category | ChoiceKraft",
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;

  const [category, categories, products] = await Promise.all([
    getCategoryBySlug(slug),
    getCategoriesSafe(),
    getProductsByCategory(slug),
  ]);

  if (!category) notFound();

  return (
    <>
      <PageHeader title={category.name} crumb={category.name.toUpperCase()} />

      <section className="mx-auto max-w-[1510px] px-6 py-16">
        {category.tagline && (
          <p className="max-w-[560px] leading-7 text-muted">
            {category.tagline}
          </p>
        )}

        {products.length > 0 ? null : (
          <Reveal>
            <div className="mt-10 flex flex-col items-center border border-line bg-surface px-6 py-16 text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white">
                <PackageSearch size={34} strokeWidth={1.4} className="text-primary" />
              </span>
              <h2 className="mt-7 text-xl font-bold uppercase tracking-[0.5px] text-ink">
                {category.name} coming soon
              </h2>
              <p className="mt-3 max-w-[460px] leading-8 text-muted">
                We are photographing and listing this range now. Call us and we
                will quote you directly in the meantime.
              </p>
              <Link
                href="/products/contact"
                className="mt-8 bg-primary px-8 py-4 text-[12px] font-semibold tracking-[2px] text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                ENQUIRE ABOUT THIS RANGE
              </Link>
            </div>
          </Reveal>
        )}
      </section>

      {products.length > 0 && (
        <ProductBrowser products={products} activeCategory={category.slug} />
      )}

      {/* Other categories */}
      <section className="mx-auto max-w-[1510px] px-6 pb-20">
        <h3 className="text-center text-[13px] font-semibold uppercase tracking-[3px] text-muted">
          Browse other categories
        </h3>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {categories
            .filter((other) => other.slug !== category.slug)
            .map((other) => (
              <Link
                key={other.slug}
                href={other.href}
                className="border border-line px-5 py-2.5 text-[12px] font-medium tracking-[1px] text-ink-soft transition-colors hover:border-primary hover:text-primary"
              >
                {other.name}
              </Link>
            ))}
        </div>
      </section>
    </>
  );
}
