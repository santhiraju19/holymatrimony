
import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface BrowseErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function BrowseErrorState({
  message,
  onRetry,
}: BrowseErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center sm:px-6 sm:py-10"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertCircle
          size={22}
        />
      </div>

      <h2 className="mt-4 text-lg font-black text-red-900">
        Unable to load profiles
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-red-700">
        {message}
      </p>

      <button
        type="button"
        onClick={
          onRetry
        }
        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        <RefreshCw
          size={16}
        />
        Try again
      </button>
    </div>
  );
}