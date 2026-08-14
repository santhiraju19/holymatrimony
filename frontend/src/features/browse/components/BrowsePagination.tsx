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
      className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:p-4"
    >
      <button
        type="button"
        onClick={
          onPrevious
        }
        disabled={
          !hasPrevious ||
          loading
        }
        className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        ← Previous
      </button>

      <p className="text-xs font-semibold text-slate-500 sm:text-sm">
        Page{" "}
        <span className="font-black text-slate-900">
          {page + 1}
        </span>{" "}
        of{" "}
        <span className="font-black text-slate-900">
          {totalPages}
        </span>
      </p>

      <button
        type="button"
        onClick={
          onNext
        }
        disabled={
          !hasNext ||
          loading
        }
        className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        Next →
      </button>
    </nav>
  );
}