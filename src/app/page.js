import { getAllProducts } from "@/lib/services/productService";
import { getBannersSafe } from "@/lib/services/bannerService";
import Hero from "./components/Hero";
import BenefitsStrip from "./components/BenefitsStrip";
import Categories from "./components/Categories";
import OfferBanner from "./components/OfferBanner";
import OffersSection from "./components/OffersSection";
import ProductBrowser from "./components/ProductBrowser";
import Reveal from "./components/Reveal";
import Manufacturing from "./components/Manufacturing";
import WhyChooseUs from "./components/WhyChooseUs";
import WhyChoiceKraft from "./components/WhyChoiceKraft";
import BulkCta from "./components/BulkCta";

export default async function Home() {
  const [products, banners, offers] = await Promise.all([
    getAllProducts(),
    getBannersSafe("homepage"),
    getBannersSafe("offer"),
  ]);

  return (
    <>
      <OfferBanner />
      <Hero banners={banners} />
      <Categories />
      <OffersSection offers={offers} />
      <BenefitsStrip />

      {/* Full catalogue, right on the homepage — same grid, filters and
          sorting as /products, not just a curated rail. */}
      <section className="bg-surface-alt">
        <div className="mx-auto max-w-[1510px] px-6 pt-20 text-center lg:pt-28">
          <Reveal>
            <h2 className="text-3xl font-bold uppercase leading-[1.2] tracking-[0.5px] text-ink lg:text-[40px]">
              Shop <span className="text-primary">our full range</span>
            </h2>
            <p className="mx-auto mt-5 max-w-[520px] leading-8 text-muted">
              Every product we stock — note books and everyday stationery
              essentials, all in one place.
            </p>
          </Reveal>
        </div>
        <ProductBrowser products={products} />
      </section>

      <Manufacturing />
      <WhyChooseUs />
      <WhyChoiceKraft />
      <BulkCta />
    </>
  );
}
