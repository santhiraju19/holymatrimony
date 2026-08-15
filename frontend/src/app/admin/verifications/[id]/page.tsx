"use client";

import Link from "next/link";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Church,
  Fingerprint,
  Loader2,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import {
  getAdminVerification,
  updateAdminVerification,
} from "@/features/admin/verifications/services/adminVerificationService";

import type {
  AdminMemberVerification,
} from "@/features/admin/verifications/types/adminVerification";

type Decision =
  | "APPROVED"
  | "REJECTED";

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString();
}

export default function AdminVerificationDetailPage() {
  const params = useParams();

  const rawId = params?.id;

  const verificationId =
    Array.isArray(rawId)
      ? rawId[0]
      : rawId;

  const [
    verification,
    setVerification,
  ] = useState<AdminMemberVerification | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const [
    decision,
    setDecision,
  ] = useState<Decision | null>(
    null
  );

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    updating,
    setUpdating,
  ] = useState(false);

  const [
    decisionError,
    setDecisionError,
  ] = useState<string | null>(
    null
  );

  const load =
    useCallback(
      async () => {
        if (
          !verificationId ||
          typeof verificationId !==
            "string"
        ) {
          setError(
            "Invalid verification ID."
          );

          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        try {
          const result =
            await getAdminVerification(
              verificationId
            );

          setVerification(
            result
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load verification request."
          );
        } finally {
          setLoading(false);
        }
      },
      [verificationId]
    );

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDecision(): Promise<void> {
    if (
      !verification ||
      !decision ||
      updating
    ) {
      return;
    }

    if (
      decision === "REJECTED" &&
      !reason.trim()
    ) {
      setDecisionError(
        "A rejection reason is required."
      );

      return;
    }

    setUpdating(true);
    setDecisionError(null);

    try {
      const updated =
        await updateAdminVerification(
          verification.id,
          {
            status: decision,
            reason:
              reason.trim() ||
              null,
          }
        );

      setVerification(
        updated
      );

      setDecision(null);
      setReason("");
    } catch (
      updateError
    ) {
      setDecisionError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update verification request."
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={34}
            className="mx-auto animate-spin text-[#0B2D5C]"
          />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading verification request...
          </p>
        </div>
      </div>
    );
  }

  if (
    error ||
    !verification
  ) {
    return (
      <div className="space-y-5">
        <Link
          href="/admin/verifications"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#0B2D5C]"
        >
          <ArrowLeft size={17} />

          Back to Verifications
        </Link>

        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-8">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={22}
              className="mt-0.5 text-red-600"
            />

            <div>
              <h2 className="font-black text-red-900">
                Verification request could not be loaded
              </h2>

              <p className="mt-2 text-sm text-red-700">
                {error ||
                  "Unable to load this verification request."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pending =
    verification.verificationStatus ===
    "PENDING";

  const typeIcon =
    verification.verificationType ===
    "CHURCH"
      ? (
        <Church size={26} />
      )
      : (
        <Fingerprint size={26} />
      );

  return (
    <div className="space-y-6 pb-10">
      <Link
        href="/admin/verifications"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#0B2D5C] transition hover:underline"
      >
        <ArrowLeft size={17} />

        Back to Verifications
      </Link>

      <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-[#071B36] via-[#0B2D5C] to-[#174A87] px-6 py-7 text-white shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              {typeIcon}
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-[#F2D675]">
                {verification.verificationType}
              </p>

              <h1 className="mt-1 text-3xl font-black">
                {verification.fullName}
              </h1>

              <p className="mt-2 text-sm text-blue-100">
                {verification.email}
              </p>

              <p className="mt-2 text-xs text-blue-200">
                Submitted{" "}
                {formatDate(
                  verification.submittedAt
                )}
              </p>
            </div>
          </div>

          {pending && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setDecisionError(null);
                  setDecision("REJECTED");
                  setReason("");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50"
              >
                <XCircle size={18} />

                Reject
              </button>

              <button
                type="button"
                onClick={() => {
                  setDecisionError(null);
                  setDecision("APPROVED");
                  setReason("");
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                <CheckCircle2 size={18} />

                Approve
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <DetailCard
          label="Verification Type"
          value={
            verification.verificationType
          }
        />

        <DetailCard
          label="Status"
          value={
            verification.verificationStatus
          }
        />

        <DetailCard
          label="Submitted"
          value={
            formatDate(
              verification.submittedAt
            )
          }
        />

        <DetailCard
          label="Reviewed"
          value={
            formatDate(
              verification.reviewedAt
            )
          }
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <UserRound
            size={21}
            className="text-[#0B2D5C]"
          />

          <h2 className="text-lg font-black text-[#0B2D5C]">
            Member Note
          </h2>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          {verification.memberNote?.trim() ||
            "No note was provided."}
        </div>
      </section>

      {verification.reviewReason && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck
              size={21}
              className="text-[#0B2D5C]"
            />

            <h2 className="text-lg font-black text-[#0B2D5C]">
              Review Note
            </h2>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            {
              verification.reviewReason
            }
          </div>
        </section>
      )}

      {verification.verificationStatus ===
        "APPROVED" && (
        <section className="flex items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <CheckCircle2
            size={22}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <div>
            <h3 className="font-black text-emerald-900">
              Verification Approved
            </h3>

            <p className="mt-1 text-sm text-emerald-700">
              Reviewed{" "}
              {formatDate(
                verification.reviewedAt
              )}
            </p>
          </div>
        </section>
      )}

      {verification.verificationStatus ===
        "REJECTED" && (
        <section className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-5">
          <XCircle
            size={22}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div>
            <h3 className="font-black text-red-900">
              Verification Rejected
            </h3>

            <p className="mt-1 text-sm text-red-700">
              The member can update their information
              and resubmit this verification.
            </p>
          </div>
        </section>
      )}

      {decision && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-black text-[#0B2D5C]">
              {decision ===
              "APPROVED"
                ? "Approve Verification"
                : "Reject Verification"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {decision ===
              "APPROVED"
                ? "Confirm that this verification request has been reviewed and approved."
                : "Explain why this verification request was rejected so the member knows what to correct."}
            </p>

            <textarea
              value={reason}
              onChange={(event) =>
                setReason(
                  event.target.value
                )
              }
              maxLength={1000}
              rows={4}
              placeholder={
                decision ===
                "REJECTED"
                  ? "Rejection reason"
                  : "Optional review note"
              }
              className="mt-5 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            {decisionError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                {decisionError}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={updating}
                onClick={() => {
                  setDecision(null);
                  setReason("");
                  setDecisionError(null);
                }}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  updating ||
                  (
                    decision ===
                      "REJECTED" &&
                    !reason.trim()
                  )
                }
                onClick={() => {
                  void handleDecision();
                }}
                className={[
                  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50",
                  decision ===
                  "APPROVED"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700",
                ].join(" ")}
              >
                {updating && (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                )}

                {updating
                  ? "Saving..."
                  : decision ===
                    "APPROVED"
                    ? "Approve"
                    : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}