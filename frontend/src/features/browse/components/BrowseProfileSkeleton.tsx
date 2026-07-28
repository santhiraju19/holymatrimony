
export default function BrowseProfileSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="aspect-[4/5] animate-pulse bg-slate-200" />

      <div className="space-y-4 p-5">
        <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />

        <div className="space-y-3">
          <div className="h-4 animate-pulse rounded bg-slate-100" />
          <div className="h-4 animate-pulse rounded bg-slate-100" />
          <div className="h-4 animate-pulse rounded bg-slate-100" />
          <div className="h-4 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}