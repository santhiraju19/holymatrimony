"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
  XCircle,
} from "lucide-react";

type Decision =
  | "APPROVED"
  | "REJECTED";

interface Props {
  open: boolean;
  decision:
    Decision | null;
  submitting: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (
    reason?: string
  ) => void | Promise<void>;
}

export default function VerificationDecisionModal({
  open,
  decision,
  submitting,
  error,
  onClose,
  onConfirm,
}: Props) {
  const [
    reason,
    setReason,
  ] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [
    open,
    decision,
  ]);

  if (
    !open ||
    !decision
  ) {
    return null;
  }

  const rejecting =
    decision === "REJECTED";

  const reasonRequired =
    rejecting;

  const canSubmit =
    !submitting &&
    (
      !reasonRequired ||
      reason.trim()
        .length > 0
    );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-start gap-3">
            <div
              className={[
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white",
                rejecting
                  ? "bg-red-600"
                  : "bg-emerald-600",
              ].join(
                " "
              )}
            >
              {rejecting ? (
                <XCircle
                  size={22}
                />
              ) : (
                <CheckCircle2
                  size={22}
                />
              )}
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                {rejecting
                  ? "Reject Profile Verification"
                  : "Approve Profile Verification"}
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {rejecting
                  ? "The member will see your rejection reason and may correct the profile before resubmitting."
                  : "This profile will become verified immediately."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={
              submitting
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <div className="px-6 py-5">
          {rejecting && (
            <div>
              <label
                htmlFor="verification-reason"
                className="text-sm font-bold text-slate-800"
              >
                Rejection Reason{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <textarea
                id="verification-reason"
                rows={6}
                maxLength={1000}
                value={reason}
                onChange={(
                  event
                ) =>
                  setReason(
                    event.target.value
                  )
                }
                placeholder="Explain clearly what the member needs to correct before resubmitting..."
                className="mt-2 w-full resize-y rounded-2xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
              />

              <p className="mt-2 text-right text-xs text-slate-400">
                {
                  reason.length
                }
                /1000
              </p>
            </div>
          )}

          {!rejecting && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0"
              />

              Confirm that the
              member's profile
              information has been
              reviewed and is
              suitable for verified
              status.
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={
              submitting
            }
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              !canSubmit
            }
            onClick={() =>
              void onConfirm(
                reason.trim() ||
                  undefined
              )
            }
            className={[
              "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50",
              rejecting
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700",
            ].join(
              " "
            )}
          >
            {submitting ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />

                Updating...
              </>
            ) : rejecting ? (
              <>
                <XCircle
                  size={17}
                />

                Reject Profile
              </>
            ) : (
              <>
                <CheckCircle2
                  size={17}
                />

                Approve Profile
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}