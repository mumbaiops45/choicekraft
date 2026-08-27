import PageHeader from "../components/PageHeader";
import ProductBrowser from "../components/ProductBrowser";
import { getStationeryProducts } from "@/lib/services/productService";

export const metadata = {
  title: "Stationery | ChoiceKraft",
};

export default async function StationeryPage() {
  const products = await getStationeryProducts();

  return (
    <>
      <PageHeader title="Stationery" crumb="STATIONERY" />
      <ProductBrowser products={products} />
    </>
  );
}
