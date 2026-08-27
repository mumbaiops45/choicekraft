import PageHeader from "../components/PageHeader";
import ProductBrowser from "../components/ProductBrowser";
import { getAllProducts } from "@/lib/services/productService";

export const metadata = {
  title: "All Products | ChoiceKraft",
};

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <>
      <PageHeader title="All Products" crumb="PRODUCTS" />
      <ProductBrowser products={products} />
    </>
  );
}
