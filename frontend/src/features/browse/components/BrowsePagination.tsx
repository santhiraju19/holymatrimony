
interface BrowsePaginationProps {
  page: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  loading: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export default function BrowsePagination({
  page,
  totalPages,
  hasPrevious,
  hasNext,
  loading,
  onPrevious,
  onNext,
}: BrowsePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Browse profile pages"
      className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row"
    >
      <button
        type="button"
        onClick={onPrevious}
        disabled={!hasPrevious || loading}
        className="w-full rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        Previous
      </button>

      <p className="text-sm font-medium text-slate-600">
        Page <span className="text-slate-900">{page + 1}</span> of{" "}
        <span className="text-slate-900">{totalPages}</span>
      </p>

      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext || loading}
        className="w-full rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        Next
      </button>
    </nav>
  );
}