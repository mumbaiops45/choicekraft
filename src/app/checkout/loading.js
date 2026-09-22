import { PageHeaderSkeleton, CheckoutSkeleton } from "../components/skeletons/Skeleton";

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton titleWidth="w-40" />
      <CheckoutSkeleton />
    </>
  );
}
