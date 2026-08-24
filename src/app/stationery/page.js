import PageHeader from "../components/PageHeader";
import ProductBrowser from "../components/ProductBrowser";
import { nonBookProducts } from "../data/products";

export const metadata = {
  title: "Stationery | ChoiceKraft",
};

export default function StationeryPage() {
  return (
    <>
      <PageHeader title="Stationery" crumb="STATIONERY" />
      <ProductBrowser products={nonBookProducts} />
    </>
  );
}
