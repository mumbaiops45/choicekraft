import { PageHeaderSkeleton, ProductGridSkeleton } from "../components/skeletons/Skeleton";

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton titleWidth="w-48" />
      <ProductGridSkeleton />
    </>
  );
}
