
export default function ProfileDetailsSkeleton() {
  return (
    <div className="animate-pulse">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="grid lg:grid-cols-[380px_1fr]">
          <div className="min-h-[460px] bg-slate-200" />

          <div className="space-y-6 p-8 lg:p-10">
            <div className="h-4 w-36 rounded bg-slate-200" />

            <div className="h-10 w-3/4 rounded bg-slate-200" />

            <div className="h-5 w-1/2 rounded bg-slate-200" />

            <div className="h-5 w-2/5 rounded bg-slate-200" />

            <div className="space-y-3 pt-6">
              <div className="h-4 rounded bg-slate-100" />
              <div className="h-4 rounded bg-slate-100" />
              <div className="h-4 w-3/4 rounded bg-slate-100" />
            </div>

            <div className="grid gap-3 pt-8 sm:grid-cols-2">
              <div className="h-12 rounded-xl bg-slate-200" />
              <div className="h-12 rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-64 rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="h-6 w-1/2 rounded bg-slate-200" />

              <div className="mt-8 grid grid-cols-2 gap-6">
                <div className="h-12 rounded bg-slate-100" />
                <div className="h-12 rounded bg-slate-100" />
                <div className="h-12 rounded bg-slate-100" />
                <div className="h-12 rounded bg-slate-100" />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}