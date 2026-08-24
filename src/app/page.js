import Hero from "./components/Hero";
import Categories from "./components/Categories";
import FeaturedProducts from "./components/FeaturedProducts";
import Manufacturing from "./components/Manufacturing";
import WhyChooseUs from "./components/WhyChooseUs";
import BulkCta from "./components/BulkCta";

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <Manufacturing />
      <WhyChooseUs />
      <BulkCta />
    </>
  );
}
