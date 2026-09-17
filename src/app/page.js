import { getNotebooks } from "@/lib/services/productService";
import { getBannersSafe } from "@/lib/services/bannerService";
import Hero from "./components/Hero";
import BenefitsStrip from "./components/BenefitsStrip";
import Categories from "./components/Categories";
import OfferBanner from "./components/OfferBanner";
import OffersSection from "./components/OffersSection";
import FeaturedProducts from "./components/FeaturedProducts";
import Manufacturing from "./components/Manufacturing";
import WhyChooseUs from "./components/WhyChooseUs";
import WhyChoiceKraft from "./components/WhyChoiceKraft";
import BulkCta from "./components/BulkCta";

export default async function Home() {
  const [notebooks, banners, offers] = await Promise.all([
    getNotebooks(),
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
      <FeaturedProducts products={notebooks} />
      <Manufacturing />
      <WhyChooseUs />
      <WhyChoiceKraft />
      <BulkCta />
    </>
  );
}
