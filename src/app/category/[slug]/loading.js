import { PageHeaderSkeleton, ProductGridSkeleton } from "../../components/skeletons/Skeleton";

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton titleWidth="w-56" />
      <ProductGridSkeleton />
    </>
  );
}
