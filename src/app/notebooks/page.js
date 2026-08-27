import PageHeader from "../components/PageHeader";
import ProductBrowser from "../components/ProductBrowser";
import { getNotebooks } from "@/lib/services/productService";

export const metadata = {
  title: "Note Books | ChoiceKraft",
};

export default async function NotebooksPage() {
  const notebooks = await getNotebooks();

  return (
    <>
      <PageHeader title="Note Books" crumb="NOTE BOOKS" />
      <ProductBrowser products={notebooks} activeCategory="notebooks" />
    </>
  );
}
