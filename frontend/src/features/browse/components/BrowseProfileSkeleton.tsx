export default function BrowseProfileSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="aspect-[5/4] animate-pulse bg-slate-200 sm:aspect-[4/3] xl:aspect-[5/4]" />

      <div className="flex flex-1 flex-col">
        <div className="flex-1 space-y-3 p-4">
          <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />

          <div className="h-3.5 w-1/2 animate-pulse rounded bg-slate-100" />

          <div className="space-y-2.5 pt-1">
            <div className="h-3.5 animate-pulse rounded bg-slate-100" />
            <div className="h-3.5 animate-pulse rounded bg-slate-100" />
            <div className="h-3.5 animate-pulse rounded bg-slate-100" />
            <div className="h-3.5 animate-pulse rounded bg-slate-100" />
          </div>

          <div className="border-t border-slate-100 pt-3">
            <div className="h-1.5 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="h-10 animate-pulse rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}