import { notFound } from "next/navigation";
import PageHeader from "../../components/PageHeader";
import ProductDetail from "../../components/ProductDetail";
import { getProductBySlugOrId } from "@/lib/services/productService";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlugOrId(slug);

  return {
    title: product ? `${product.name} | ChoiceKraft` : "Product | ChoiceKraft",
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlugOrId(slug);

  if (!product) notFound();

  return (
    <>
      <PageHeader title={product.name} crumb={product.name.toUpperCase()} />
      <ProductDetail product={product} />
    </>
  );
}
