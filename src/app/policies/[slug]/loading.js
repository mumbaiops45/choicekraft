import { PageHeaderSkeleton, TextPageSkeleton } from "../../components/skeletons/Skeleton";

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton titleWidth="w-56" />
      <TextPageSkeleton />
    </>
  );
}
