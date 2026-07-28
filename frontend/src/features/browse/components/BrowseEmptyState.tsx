
interface BrowseEmptyStateProps {
  onRefresh: () => void;
}

export default function BrowseEmptyState({
  onRefresh,
}: BrowseEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-3xl">
        ♡
      </div>

      <h2 className="mt-6 text-2xl font-bold text-slate-900">
        No profiles found
      </h2>

      <p className="mx-auto mt-3 max-w-lg text-slate-600">
        There are currently no eligible profiles available. New profiles
        will appear here after registration and profile completion.
      </p>

      <button
        type="button"
        onClick={onRefresh}
        className="mt-7 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
      >
        Refresh profiles
      </button>
    </div>
  );
}