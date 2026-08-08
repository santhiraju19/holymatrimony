"use client";

import type {
  UserStatus,
} from "../types/adminUser";

interface ConfirmStatusModalProps {
  open: boolean;
  userName: string;
  currentStatus: UserStatus;
  nextStatus: UserStatus;
  reason: string;
  loading?: boolean;

  onCancel: () => void;
  onConfirm: () => void;
}

function formatStatus(
  status: UserStatus
) {
  return status
    .toLowerCase()
    .replace(
      /^\w/,
      (value) =>
        value.toUpperCase()
    );
}

export default function ConfirmStatusModal({
  open,
  userName,
  currentStatus,
  nextStatus,
  reason,
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmStatusModalProps) {
  if (!open) {
    return null;
  }

  const isRestoring =
    nextStatus === "ACTIVE";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B78A22]">
            Confirmation Required
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-900">
            {isRestoring
              ? "Reactivate account?"
              : `Change status to ${formatStatus(
                  nextStatus
                )}?`}
          </h2>
        </div>

        <div className="space-y-5 px-6 py-6">
          <p className="text-sm leading-6 text-slate-600">
            You are about to change{" "}
            <span className="font-semibold text-slate-900">
              {userName}
            </span>
            {" "}from{" "}
            <span className="font-semibold">
              {formatStatus(
                currentStatus
              )}
            </span>
            {" "}to{" "}
            <span className="font-semibold">
              {formatStatus(
                nextStatus
              )}
            </span>
            .
          </p>

          {!isRestoring && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">
                This account will no longer be allowed to sign in.
              </p>
            </div>
          )}

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Reason
            </p>

            <div className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {reason.trim() ||
                "No reason provided."}
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={[
              "flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50",
              isRestoring
                ? "bg-emerald-600 hover:bg-emerald-700"
                : nextStatus ===
                    "BLOCKED"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#0B2D5C] hover:bg-[#123C73]",
            ].join(" ")}
          >
            {loading
              ? "Updating..."
              : isRestoring
                ? "Reactivate User"
                : `Confirm ${formatStatus(
                    nextStatus
                  )}`}
          </button>
        </div>
      </div>
    </div>
  );
}