"use client";

import Link from "next/link";

import {
  Crown,
  Eye,
  Loader2,
  Search,
  ShieldCheck,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getAdminVerifications,
} from "@/features/admin/verifications/services/adminVerificationService";

import type {
  AdminMemberVerification,
  VerificationStatus,
  VerificationType,
} from "@/features/admin/verifications/types/adminVerification";

import AdminPageHeader from "@/features/admin/components/ui/AdminPageHeader";
import AdminSectionCard from "@/features/admin/components/ui/AdminSectionCard";

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

function statusClasses(
  status: VerificationStatus
): string {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-100 text-emerald-700";

    case "REJECTED":
      return "bg-red-100 text-red-700";

    case "PENDING":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
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

function isPriorityChurchVerification(
  verification: AdminMemberVerification
): boolean {
  return (
    verification.verificationType === "CHURCH" &&
    verification.priorityChurchVerification === true
  );
}

export default function AdminVerificationsPage() {
  const [
    verifications,
    setVerifications,
  ] = useState<
    AdminMemberVerification[]
  >([]);

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
    search,
    setSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState<
    VerificationStatus | ""
  >("PENDING");

  const [
    type,
    setType,
  ] = useState<
    VerificationType | ""
  >("");

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError(null);

        try {
          const result =
            await getAdminVerifications({
              page: 0,
              size: 50,
              search,
              status,
              type,
            });

          setVerifications(
            result.content
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load verification requests."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        search,
        status,
        type,
      ]
    );

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6 pb-10">
      <AdminPageHeader
        eyebrow="Member Administration"
        title="Trust & Verification"
        description="Review church and identity verification requests."
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
            <ShieldCheck size={22} />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              Verification Review Queue
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Review submitted member trust and verification requests.
            </p>
          </div>
        </div>
      </AdminPageHeader>

      <AdminSectionCard
        title="Search & Filters"
        description="Narrow the verification review queue by member, status or verification type."
        icon={Search}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search member..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as
                  | VerificationStatus
                  | ""
              )
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">
              All statuses
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="APPROVED">
              Approved
            </option>

            <option value="REJECTED">
              Rejected
            </option>
          </select>

          <select
            value={type}
            onChange={(event) =>
              setType(
                event.target.value as
                  | VerificationType
                  | ""
              )
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">
              All types
            </option>

            <option value="CHURCH">
              Church
            </option>

            <option value="IDENTITY">
              Identity
            </option>
          </select>
        </div>
      </AdminSectionCard>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <AdminSectionCard
        title="Verification Requests"
        description={`${verifications.length} request${
          verifications.length === 1 ? "" : "s"
        } in the current review queue.`}
        icon={ShieldCheck}
        contentClassName="p-0"
      >
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <Loader2
              size={30}
              className="animate-spin text-[#0B2D5C]"
            />
          </div>
        ) : verifications.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ShieldCheck size={24} />
            </div>

            <h3 className="mt-4 font-black text-slate-800">
              No verification requests
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              No requests match the current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    Member
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    Type
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    Priority
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    Submitted
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {verifications.map(
                  (verification) => {
                    const priority =
                      isPriorityChurchVerification(
                        verification
                      );

                    return (
                      <tr
                        key={
                          verification.id
                        }
                        className={
                          priority
                            ? "bg-amber-50/40 transition hover:bg-amber-50/70"
                            : "transition hover:bg-slate-50"
                        }
                      >
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">
                            {verification.fullName}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {verification.email}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm font-bold text-[#0B2D5C]">
                          {formatVerificationType(
                            verification.verificationType
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={[
                              "inline-flex rounded-full px-3 py-1 text-xs font-black",
                              statusClasses(
                                verification.verificationStatus
                              ),
                            ].join(" ")}
                          >
                            {verification.verificationStatus}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {priority ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 shadow-sm">
                              <Crown size={14} />
                              Priority
                            </span>
                          ) : verification.verificationType ===
                            "CHURCH" ? (
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                              Standard
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">
                              —
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                          {formatDate(
                            verification.submittedAt
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/admin/verifications/${verification.id}`}
                            className={[
                              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition",
                              priority
                                ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                                : "border-slate-200 text-[#0B2D5C] hover:border-[#0B2D5C] hover:bg-blue-50",
                            ].join(" ")}
                          >
                            <Eye size={15} />
                            Review
                          </Link>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </AdminSectionCard>

    </div>
  );
}
