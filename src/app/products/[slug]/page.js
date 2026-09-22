import { notFound } from "next/navigation";
import PageHeader from "../../components/PageHeader";
import ProductDetail from "../../components/ProductDetail";
import {
  getProductBySlugOrId,
  getProductWithVariants,
} from "@/lib/services/productService";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  // The title only needs the product itself — fetching variants here too
  // would be a second, wasted round trip for every page load.
  const product = await getProductBySlugOrId(slug);

  return {
    title: product ? `${product.name} | ChoiceKraft` : "Product | ChoiceKraft",
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductWithVariants(slug);

  if (!product) notFound();

  return (
    <>
      <PageHeader title={product.name} crumb={product.name.toUpperCase()} />
      {/* Forces a fresh mount per product, so its picked variant, quantity
          and pending state never carry over from client-side navigating
          straight from one product page to another. */}
      <ProductDetail key={product.id} product={product} />
    </>
  );
}
