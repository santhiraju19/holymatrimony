
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
      className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center"
    >
      <h2 className="text-xl font-bold text-red-900">
        Unable to load profiles
      </h2>

      <p className="mt-2 text-red-700">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}