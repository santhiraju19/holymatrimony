"use client";

import Link from "next/link";

import {
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
            loadError instanceof
              Error
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
      <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-[#071B36] via-[#0B2D5C] to-[#174A87] px-6 py-7 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <ShieldCheck size={28} />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-[#F2D675]">
              Admin Review
            </p>

            <h1 className="mt-1 text-3xl font-black">
              Trust & Verification
            </h1>

            <p className="mt-2 text-sm text-blue-100">
              Review church and identity
              verification requests.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
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
              className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
            className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
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
            className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
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
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2
            size={30}
            className="animate-spin text-[#0B2D5C]"
          />
        </div>
      ) : verifications.length ===
        0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <ShieldCheck
            size={30}
            className="mx-auto text-slate-400"
          />

          <h3 className="mt-4 font-black text-slate-800">
            No verification requests
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            No requests match the current filters.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
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
                    Submitted
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {verifications.map(
                  (verification) => (
                    <tr
                      key={
                        verification.id
                      }
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">
                          {
                            verification.fullName
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {
                            verification.email
                          }
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-[#0B2D5C]">
                        {
                          verification.verificationType
                        }
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-3 py-1 text-xs font-black",
                            statusClasses(
                              verification.verificationStatus
                            ),
                          ].join(
                            " "
                          )}
                        >
                          {
                            verification.verificationStatus
                          }
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(
                          verification.submittedAt
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/verifications/${verification.id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-[#0B2D5C] transition hover:border-[#0B2D5C] hover:bg-blue-50"
                        >
                          <Eye size={15} />

                          Review
                        </Link>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}