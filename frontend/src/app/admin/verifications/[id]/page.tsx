"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  FileText,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  getAdminIdentityDocument,
  getAdminVerification,
  updateAdminVerification,
} from "@/features/admin/verifications/services/adminVerificationService";

import type {
  AdminMemberVerification,
  VerificationStatus,
  VerificationType,
} from "@/features/admin/verifications/types/adminVerification";

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString();
}

function formatFileSize(
  value?: number | null
): string {
  if (
    value === null ||
    value === undefined ||
    value <= 0
  ) {
    return "—";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  const kb =
    value / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  const mb =
    kb / 1024;

  return `${mb.toFixed(1)} MB`;
}

function formatVerificationType(
  type: VerificationType
): string {
  switch (type) {
    case "MOBILE":
      return "Mobile";

    case "CHURCH":
      return "Church";

    case "IDENTITY":
      return "Identity";

    default:
      return type;
  }
}

function formatDocumentType(
  value?: string | null
): string {
  if (!value) {
    return "—";
  }

  switch (value) {
    case "AADHAAR":
      return "Aadhaar";

    case "PASSPORT":
      return "Passport";

    case "DRIVING_LICENCE":
      return "Driving Licence";

    case "VOTER_ID":
      return "Voter ID";

    default:
      return value
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
          /\b\w/g,
          (character) =>
            character.toUpperCase()
        );
  }
}

function getStatusClasses(
  status: VerificationStatus
): string {
  switch (status) {
    case "APPROVED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-700";

    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "NOT_SUBMITTED":
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function DetailCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default function AdminVerificationDetailPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const router =
    useRouter();

  const verificationId =
    params?.id;

  const [
    verification,
    setVerification,
  ] =
    useState<AdminMemberVerification | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    actionError,
    setActionError,
  ] =
    useState<string | null>(
      null
    );

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState<
      "APPROVED" |
      "REJECTED" |
      null
    >(null);

  const [
    reason,
    setReason,
  ] =
    useState("");

  const [
    documentLoading,
    setDocumentLoading,
  ] =
    useState(false);

  const [
    documentError,
    setDocumentError,
  ] =
    useState<string | null>(
      null
    );

  const loadVerification =
    useCallback(
      async () => {
        if (!verificationId) {
          setError(
            "Verification ID is missing."
          );

          setLoading(false);

          return;
        }

        setLoading(true);
        setError(null);

        try {
          const data =
            await getAdminVerification(
              verificationId
            );

          setVerification(
            data
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

  useEffect(
    () => {
      void loadVerification();
    },
    [loadVerification]
  );

  async function handleReview(
    status:
      | "APPROVED"
      | "REJECTED"
  ): Promise<void> {
    if (
      !verification ||
      actionLoading
    ) {
      return;
    }

    const normalizedReason =
      reason.trim();

    if (
      status ===
        "REJECTED" &&
      !normalizedReason
    ) {
      setActionError(
        "Please enter a reason before rejecting this verification."
      );

      return;
    }

    setActionLoading(
      status
    );

    setActionError(
      null
    );

    try {
      const updated =
        await updateAdminVerification(
          verification.id,
          {
            status,
            reason:
              normalizedReason ||
              null,
          }
        );

      setVerification(
        updated
      );

      setReason("");
    } catch (
      reviewError
    ) {
      setActionError(
        reviewError instanceof Error
          ? reviewError.message
          : "Unable to update verification request."
      );
    } finally {
      setActionLoading(
        null
      );
    }
  }

  async function handleViewIdentityDocument(): Promise<void> {
    if (
      !verification ||
      documentLoading
    ) {
      return;
    }

    setDocumentLoading(
      true
    );

    setDocumentError(
      null
    );

    try {
      const blob =
        await getAdminIdentityDocument(
          verification.id
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const newWindow =
        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );

      if (!newWindow) {
        URL.revokeObjectURL(
          url
        );

        throw new Error(
          "The browser blocked the document preview window."
        );
      }

      window.setTimeout(
        () => {
          URL.revokeObjectURL(
            url
          );
        },
        60_000
      );
    } catch (
      viewError
    ) {
      setDocumentError(
        viewError instanceof Error
          ? viewError.message
          : "Unable to open identity document."
      );
    } finally {
      setDocumentLoading(
        false
      );
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          <Loader2
            size={20}
            className="animate-spin"
          />

          Loading verification...
        </div>
      </div>
    );
  }

  if (
    error ||
    !verification
  ) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/admin/verifications"
            )
          }
          className="inline-flex items-center gap-2 text-sm font-bold text-[#0B2D5C] transition hover:text-[#D4AF37]"
        >
          <ArrowLeft
            size={17}
          />

          Back to Verifications
        </button>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">
          {error ||
            "Verification request was not found."}
        </div>
      </div>
    );
  }

  const isPending =
    verification.verificationStatus ===
    "PENDING";

  const isIdentity =
    verification.verificationType ===
    "IDENTITY";

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() =>
          router.push(
            "/admin/verifications"
          )
        }
        className="inline-flex items-center gap-2 text-sm font-bold text-[#0B2D5C] transition hover:text-[#D4AF37]"
      >
        <ArrowLeft
          size={17}
        />

        Back to Verifications
      </button>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-r from-[#0B2D5C] to-[#123f75] px-6 py-7 text-white sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <ShieldCheck
                  size={24}
                />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">
                  Member Verification
                </p>

                <h1 className="mt-1 text-2xl font-black">
                  {formatVerificationType(
                    verification.verificationType
                  )}{" "}
                  Verification
                </h1>

                <p className="mt-2 text-sm text-blue-100">
                  Review the member submission and update its verification status.
                </p>
              </div>
            </div>

            <span
              className={`inline-flex w-fit items-center rounded-full border px-4 py-2 text-xs font-black ${getStatusClasses(
                verification.verificationStatus
              )}`}
            >
              {verification.verificationStatus.replaceAll(
                "_",
                " "
              )}
            </span>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 sm:p-8">
          <DetailCard
            label="Member"
            value={
              verification.fullName ||
              "—"
            }
          />

          <DetailCard
            label="Email"
            value={
              verification.email ||
              "—"
            }
          />

          <DetailCard
            label="Verification Type"
            value={formatVerificationType(
              verification.verificationType
            )}
          />

          <DetailCard
            label="Submitted"
            value={formatDate(
              verification.submittedAt
            )}
          />

          <DetailCard
            label="Created"
            value={formatDate(
              verification.createdAt
            )}
          />

          <DetailCard
            label="Last Updated"
            value={formatDate(
              verification.updatedAt
            )}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-[#0B2D5C]">
          Member Note
        </h2>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
          {verification.memberNote ||
            "No note was provided by the member."}
        </div>
      </section>

      {isIdentity && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
                <FileText
                  size={21}
                />
              </div>

              <div>
                <h2 className="text-lg font-black text-[#0B2D5C]">
                  Identity Document
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Private document submitted by the member for identity verification.
                </p>
              </div>
            </div>

            {verification.hasIdentityDocument && (
              <button
                type="button"
                disabled={
                  documentLoading
                }
                onClick={() => {
                  void handleViewIdentityDocument();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123f75] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {documentLoading ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Eye
                    size={17}
                  />
                )}

                {documentLoading
                  ? "Opening..."
                  : "View Document"}
              </button>
            )}
          </div>

          {verification.hasIdentityDocument ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <DetailCard
                label="Document Type"
                value={formatDocumentType(
                  verification.identityDocumentType
                )}
              />

              <DetailCard
                label="File Name"
                value={
                  verification.identityDocumentFileName ||
                  "—"
                }
              />

              <DetailCard
                label="Content Type"
                value={
                  verification.identityDocumentContentType ||
                  "—"
                }
              />

              <DetailCard
                label="File Size"
                value={formatFileSize(
                  verification.identityDocumentFileSize
                )}
              />
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              No identity document is attached to this verification request.
            </div>
          )}

          {documentError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {documentError}
            </div>
          )}
        </section>
      )}

      {verification.reviewedAt && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#0B2D5C]">
            Review Result
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <DetailCard
              label="Reviewed At"
              value={formatDate(
                verification.reviewedAt
              )}
            />

            <DetailCard
              label="Reviewed By"
              value={
                verification.reviewedBy ||
                "—"
              }
            />
          </div>

          {verification.reviewReason && (
            <div className="mt-4">
              <DetailCard
                label="Review Reason / Note"
                value={
                  verification.reviewReason
                }
              />
            </div>
          )}
        </section>
      )}

      {isPending && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-black text-[#0B2D5C]">
              Review Verification
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Approve the request or provide a reason and reject it.
            </p>
          </div>

          {isIdentity &&
            !verification.hasIdentityDocument && (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                This identity request has no document attached. The backend will prevent approval until a document exists.
              </div>
            )}

          <div className="mt-5">
            <label
              htmlFor="review-reason"
              className="text-sm font-bold text-slate-700"
            >
              Review note / rejection reason
            </label>

            <textarea
              id="review-reason"
              rows={4}
              value={reason}
              onChange={(
                event
              ) =>
                setReason(
                  event.target.value
                )
              }
              placeholder="Add an optional approval note, or enter the required reason when rejecting..."
              className="mt-2 w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {actionError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {actionError}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={
                actionLoading !==
                  null ||
                (
                  isIdentity &&
                  !verification.hasIdentityDocument
                )
              }
              onClick={() => {
                void handleReview(
                  "APPROVED"
                );
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading ===
              "APPROVED" ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <CheckCircle2
                  size={17}
                />
              )}

              {actionLoading ===
              "APPROVED"
                ? "Approving..."
                : "Approve"}
            </button>

            <button
              type="button"
              disabled={
                actionLoading !==
                null
              }
              onClick={() => {
                void handleReview(
                  "REJECTED"
                );
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading ===
              "REJECTED" ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <XCircle
                  size={17}
                />
              )}

              {actionLoading ===
              "REJECTED"
                ? "Rejecting..."
                : "Reject"}
            </button>
          </div>
        </section>
      )}

      {!isPending && (
        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
          This verification request has already been reviewed and can no longer be changed.
        </section>
      )}
    </div>
  );
}