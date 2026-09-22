import { Block, Bar } from "./components/skeletons/Skeleton";

/** Shown while the home page's banners and featured notebooks load. */
export default function Loading() {
  return (
    <>
      <div aria-hidden="true" className="h-[70vh] max-h-[820px] w-full bg-ink/10" />
      <div className="mx-auto max-w-[1510px] px-6 py-20" aria-hidden="true">
        <Bar className="mx-auto h-8 w-64" />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Block key={i} className="aspect-square w-full" />
          ))}
        </div>
      </div>
    </>
  );
}
