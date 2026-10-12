"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  CheckCircle2,
  Church,
  Crown,
  Eye,
  FileText,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  getAdminChurchDocument,
  getAdminIdentityDocument,
  getAdminVerification,
  updateAdminVerification,
} from "@/features/admin/verifications/services/adminVerificationService";

import type {
  AdminMemberVerification,
  ChurchVerificationMethod,
  VerificationStatus,
  VerificationType,
} from "@/features/admin/verifications/types/adminVerification";

import AdminButton from "@/features/admin/components/ui/AdminButton";
import AdminPageHeader from "@/features/admin/components/ui/AdminPageHeader";
import AdminSectionCard from "@/features/admin/components/ui/AdminSectionCard";

/*
 * ============================================================
 * Formatting
 * ============================================================
 */

function formatDate(
  value?: string | null
): string {

  if (!value) {
    return "—";
  }

  const date =
    new Date(
      value
    );

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

  if (
    value < 1024
  ) {

    return `${value} B`;
  }

  const kb =
    value / 1024;

  if (
    kb < 1024
  ) {

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
        .replaceAll(
          "_",
          " "
        )
        .toLowerCase()
        .replace(
          /\b\w/g,
          (character) =>
            character.toUpperCase()
        );
  }
}

function formatChurchVerificationMethod(
  value?:
    | ChurchVerificationMethod
    | null
): string {

  switch (value) {

    case "DOCUMENT":
      return "Church-issued Document";

    case "PASTOR_CONTACT":
      return "Pastor / Church Contact";

    case "MEMBERSHIP_ID":
      return "Membership ID";

    default:
      return "—";
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

/*
 * ============================================================
 * Detail Card
 * ============================================================
 */

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

/*
 * ============================================================
 * Page
 * ============================================================
 */

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
      | "APPROVED"
      | "REJECTED"
      | null
    >(
      null
    );

  const [
    reason,
    setReason,
  ] =
    useState("");

  /*
   * Identity document state
   */

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

  /*
   * Church document state
   */

  const [
    churchDocumentLoading,
    setChurchDocumentLoading,
  ] =
    useState(false);

  const [
    churchDocumentError,
    setChurchDocumentError,
  ] =
    useState<string | null>(
      null
    );

  /*
   * ============================================================
   * Load Verification
   * ============================================================
   */

  const loadVerification =
    useCallback(
      async () => {

        if (
          !verificationId
        ) {

          setError(
            "Verification ID is missing."
          );

          setLoading(
            false
          );

          return;
        }

        setLoading(
          true
        );

        setError(
          null
        );

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

          setLoading(
            false
          );
        }
      },
      [
        verificationId,
      ]
    );

  useEffect(
    () => {

      void loadVerification();
    },
    [
      loadVerification,
    ]
  );

  /*
   * ============================================================
   * Review
   * ============================================================
   */

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

  /*
   * ============================================================
   * Identity Document Preview
   * ============================================================
   */

  async function handleViewIdentityDocument():
    Promise<void> {

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

      openDocumentBlob(
        blob
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

  /*
   * ============================================================
   * Church Document Preview
   * ============================================================
   */

  async function handleViewChurchDocument():
    Promise<void> {

    if (
      !verification ||
      churchDocumentLoading
    ) {

      return;
    }

    setChurchDocumentLoading(
      true
    );

    setChurchDocumentError(
      null
    );

    try {

      const blob =
        await getAdminChurchDocument(
          verification.id
        );

      openDocumentBlob(
        blob
      );

    } catch (
      viewError
    ) {

      setChurchDocumentError(
        viewError instanceof Error
          ? viewError.message
          : "Unable to open church verification document."
      );

    } finally {

      setChurchDocumentLoading(
        false
      );
    }
  }

  /*
   * ============================================================
   * Open Protected Blob
   * ============================================================
   */

  function openDocumentBlob(
    blob: Blob
  ): void {

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

    if (
      !newWindow
    ) {

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
  }

  /*
   * ============================================================
   * Loading
   * ============================================================
   */

  if (
    loading
  ) {

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

  /*
   * ============================================================
   * Error
   * ============================================================
   */

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

  /*
   * ============================================================
   * Derived State
   * ============================================================
   */

  const isPending =
    verification
      .verificationStatus ===
    "PENDING";

  const isIdentity =
    verification
      .verificationType ===
    "IDENTITY";

  const isChurch =
    verification
      .verificationType ===
    "CHURCH";

  const isPriorityChurchVerification =
    isChurch &&
    verification
      .priorityChurchVerification ===
      true;

  const churchMethod =
    verification
      .churchVerificationMethod;

  const approvalBlocked =
    (
      isIdentity &&
      !verification.hasIdentityDocument
    ) ||
    (
      isChurch &&
      !verification.hasChurchSubmission
    );

  /*
   * ============================================================
   * Render
   * ============================================================
   */

  return (
    <div className="space-y-6">

      <AdminPageHeader
        eyebrow="Member Administration"
        title={`${formatVerificationType(
          verification.verificationType
        )} Verification`}
        description="Review the member submission and update its verification status."
        actions={
          <AdminButton
            variant="secondary"
            size="sm"
            icon={<ArrowLeft size={16} />}
            onClick={() =>
              router.push(
                "/admin/verifications"
              )
            }
          >
            Back to Verifications
          </AdminButton>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            value={
              formatVerificationType(
                verification.verificationType
              )
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
            label="Created"
            value={
              formatDate(
                verification.createdAt
              )
            }
          />

          <DetailCard
            label="Last Updated"
            value={
              formatDate(
                verification.updatedAt
              )
            }
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-black ${getStatusClasses(
              verification.verificationStatus
            )}`}
          >
            {verification.verificationStatus.replaceAll(
              "_",
              " "
            )}
          </span>

          {isPriorityChurchVerification && (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-900">
              <Crown size={14} />
              Priority Church Verification
            </span>
          )}
        </div>
      </AdminPageHeader>

      {/* ========================================================
          Member Note
         ======================================================== */}

      <AdminSectionCard
        title="Member Note"
        description="Additional information provided by the member with this verification request."
        icon={FileText}
      >
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
          {verification.memberNote ||
            "No note was provided by the member."}
        </div>
      </AdminSectionCard>

      {/* ========================================================
          Identity Verification
         ======================================================== */}

      {isIdentity && (
        <AdminSectionCard
          title="Identity Document"
          description="Private document submitted by the member for identity verification."
          icon={FileText}
          actions={
            verification.hasIdentityDocument ? (
              <AdminButton
                variant="primary"
                size="sm"
                loading={documentLoading}
                disabled={documentLoading}
                icon={
                  documentLoading
                    ? undefined
                    : <Eye size={16} />
                }
                onClick={() => {
                  void handleViewIdentityDocument();
                }}
              >
                {documentLoading
                  ? "Opening..."
                  : "View Document"}
              </AdminButton>
            ) : undefined
          }
        >
          {verification.hasIdentityDocument ? (
            <div className="grid gap-4 md:grid-cols-2">
              <DetailCard
                label="Document Type"
                value={
                  formatDocumentType(
                    verification.identityDocumentType
                  )
                }
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
                value={
                  formatFileSize(
                    verification.identityDocumentFileSize
                  )
                }
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              No identity document is attached to this verification request.
            </div>
          )}

          {documentError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {documentError}
            </div>
          )}
        </AdminSectionCard>
      )}

      {/* ========================================================
          Church Verification
         ======================================================== */}

      {isChurch && (
        <AdminSectionCard
          title="Church Verification Submission"
          description="Review how the member has chosen to verify their church affiliation."
          icon={Church}
          actions={
            verification.hasChurchDocument ? (
              <AdminButton
                variant="primary"
                size="sm"
                loading={churchDocumentLoading}
                disabled={churchDocumentLoading}
                icon={
                  churchDocumentLoading
                    ? undefined
                    : <Eye size={16} />
                }
                onClick={() => {
                  void handleViewChurchDocument();
                }}
              >
                {churchDocumentLoading
                  ? "Opening..."
                  : "View Church Proof"}
              </AdminButton>
            ) : undefined
          }
        >
          {isPriorityChurchVerification && (
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-800">
              <Crown size={13} />
              Platinum Priority Review
            </div>
          )}

          {verification.hasChurchSubmission ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <DetailCard
                  label="Verification Method"
                  value={
                    formatChurchVerificationMethod(
                      churchMethod
                    )
                  }
                />

                {churchMethod ===
                  "PASTOR_CONTACT" && (
                  <DetailCard
                    label="Pastor / Contact Name"
                    value={
                      verification.churchPastorName ||
                      "—"
                    }
                  />
                )}

                {churchMethod ===
                  "PASTOR_CONTACT" && (
                  <DetailCard
                    label="Church Phone"
                    value={
                      verification.churchPhone ||
                      "—"
                    }
                  />
                )}

                {churchMethod ===
                  "PASTOR_CONTACT" && (
                  <DetailCard
                    label="Church Email"
                    value={
                      verification.churchEmail ||
                      "—"
                    }
                  />
                )}

                {churchMethod ===
                  "MEMBERSHIP_ID" && (
                  <DetailCard
                    label="Membership ID / Member Number"
                    value={
                      verification.churchMembershipId ||
                      "—"
                    }
                  />
                )}
              </div>

              {verification.hasChurchDocument && (
                <div className="mt-6 border-t border-slate-200 pt-5">
                  <h3 className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Supporting Document
                  </h3>

                  <div className="mt-3 grid gap-4 md:grid-cols-3">
                    <DetailCard
                      label="File Name"
                      value={
                        verification.churchDocumentFileName ||
                        "—"
                      }
                    />

                    <DetailCard
                      label="Content Type"
                      value={
                        verification.churchDocumentContentType ||
                        "—"
                      }
                    />

                    <DetailCard
                      label="File Size"
                      value={
                        formatFileSize(
                          verification.churchDocumentFileSize
                        )
                      }
                    />
                  </div>
                </div>
              )}

              {churchMethod ===
                "DOCUMENT" &&
                !verification.hasChurchDocument && (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                    This request selected document verification, but no church document is attached.
                  </div>
                )}

              {churchMethod ===
                "PASTOR_CONTACT" && (
                  <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                    Verify the member&apos;s affiliation using the church phone or email before approving this request.
                  </div>
                )}

              {churchMethod ===
                "MEMBERSHIP_ID" && (
                  <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                    Review the membership number and any optional supporting document before approving this request.
                  </div>
                )}
            </>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              No Church verification submission is attached to this request.
            </div>
          )}

          {churchDocumentError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {churchDocumentError}
            </div>
          )}
        </AdminSectionCard>
      )}

      {/* ========================================================
          Review Result
         ======================================================== */}

      {verification.reviewedAt && (
        <AdminSectionCard
          title="Review Result"
          description="Final administrative review information for this verification request."
          icon={
            verification.verificationStatus === "APPROVED"
              ? CheckCircle2
              : verification.verificationStatus === "REJECTED"
                ? XCircle
                : ShieldCheck
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <DetailCard
              label="Reviewed At"
              value={
                formatDate(
                  verification.reviewedAt
                )
              }
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
        </AdminSectionCard>
      )}

      {/* ========================================================
          Review Actions
         ======================================================== */}

      {isPending && (
        <AdminSectionCard
          title="Review Verification"
          description="Approve the request or provide a reason and reject it."
          icon={ShieldCheck}
        >
          {isIdentity &&
            !verification.hasIdentityDocument && (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                This identity request has no document attached. Approval is disabled.
              </div>
            )}

          {isChurch &&
            !verification.hasChurchSubmission && (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                This Church request has no Church verification submission. Approval is disabled.
              </div>
            )}

          <div>
            <label
              htmlFor="review-reason"
              className="text-sm font-bold text-slate-700"
            >
              Review note / rejection reason
            </label>

            <textarea
              id="review-reason"
              rows={4}
              value={
                reason
              }
              onChange={
                (event) =>
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
            <AdminButton
              variant="success"
              disabled={
                actionLoading !== null ||
                approvalBlocked
              }
              loading={
                actionLoading === "APPROVED"
              }
              icon={
                actionLoading === "APPROVED"
                  ? undefined
                  : <CheckCircle2 size={17} />
              }
              onClick={() => {
                void handleReview(
                  "APPROVED"
                );
              }}
            >
              {actionLoading === "APPROVED"
                ? "Approving..."
                : "Approve"}
            </AdminButton>

            <AdminButton
              variant="danger"
              disabled={
                actionLoading !== null
              }
              loading={
                actionLoading === "REJECTED"
              }
              icon={
                actionLoading === "REJECTED"
                  ? undefined
                  : <XCircle size={17} />
              }
              onClick={() => {
                void handleReview(
                  "REJECTED"
                );
              }}
            >
              {actionLoading === "REJECTED"
                ? "Rejecting..."
                : "Reject"}
            </AdminButton>
          </div>
        </AdminSectionCard>
      )}

      {!isPending && (
        <AdminSectionCard
          title="Review Complete"
          description="This verification request has already been reviewed and can no longer be changed."
          icon={ShieldCheck}
        >
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
            The verification decision is read-only. Review the result above for the recorded decision and administrative notes.
          </div>
        </AdminSectionCard>
      )}

    </div>
  );
}