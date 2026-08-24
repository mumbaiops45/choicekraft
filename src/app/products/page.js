import PageHeader from "../components/PageHeader";
import ProductBrowser from "../components/ProductBrowser";
import { allProducts } from "../data/products";

export const metadata = {
  title: "All Products | ChoiceKraft",
};

export default function ProductsPage() {
  return (
    <>
      <PageHeader title="All Products" crumb="PRODUCTS" />
      <ProductBrowser products={allProducts} />
    </>
  );
}
