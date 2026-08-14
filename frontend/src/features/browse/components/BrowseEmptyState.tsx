
import {
  Heart,
  RefreshCw,
} from "lucide-react";

interface BrowseEmptyStateProps {
  onRefresh: () => void;
}

export default function BrowseEmptyState({
  onRefresh,
}: BrowseEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center sm:px-6 sm:py-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Heart
          size={25}
        />
      </div>

      <h2 className="mt-4 text-lg font-black text-[#0B2D5C] sm:text-xl">
        No profiles found
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
        No profiles currently match your search. Try adjusting your
        filters or check again as new profiles become available.
      </p>

      <button
        type="button"
        onClick={
          onRefresh
        }
        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        <RefreshCw
          size={16}
        />
        Refresh profiles
      </button>
    </div>
  );
}