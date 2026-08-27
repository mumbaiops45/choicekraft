import { getNotebooks } from "@/lib/services/productService";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import FeaturedProducts from "./components/FeaturedProducts";
import Manufacturing from "./components/Manufacturing";
import WhyChooseUs from "./components/WhyChooseUs";
import BulkCta from "./components/BulkCta";

export default async function Home() {
  const notebooks = await getNotebooks();

  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts products={notebooks} />
      <Manufacturing />
      <WhyChooseUs />
      <BulkCta />
    </>
  );
}
