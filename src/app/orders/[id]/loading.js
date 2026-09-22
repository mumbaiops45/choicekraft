import { PageHeaderSkeleton, OrderDetailSkeleton } from "../../components/skeletons/Skeleton";

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton titleWidth="w-56" />
      <OrderDetailSkeleton />
    </>
  );
}
