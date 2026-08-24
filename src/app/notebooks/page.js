import PageHeader from "../components/PageHeader";
import ProductBrowser from "../components/ProductBrowser";
import { notebooks } from "../data/products";

export const metadata = {
  title: "Note Books | ChoiceKraft",
};

export default function NotebooksPage() {
  return (
    <>
      <PageHeader title="Note Books" crumb="NOTE BOOKS" />
      <ProductBrowser products={notebooks} activeCategory="notebooks" />
    </>
  );
}
