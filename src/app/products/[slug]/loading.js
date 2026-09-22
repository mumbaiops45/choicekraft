import { PageHeaderSkeleton, ProductDetailSkeleton } from "../../components/skeletons/Skeleton";

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton titleWidth="w-80" />
      <ProductDetailSkeleton />
    </>
  );
}
