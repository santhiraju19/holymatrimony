"use client";

import {
  KeyRound,
  Mail,
  Settings2,
  ShieldCheck,
  UserCog,
} from "lucide-react";

import type {
  AdminSubAdmin,
} from "../types/adminSubAdmin";

import SubAdminStatusBadge from "./SubAdminStatusBadge";

interface SubAdminTableProps {
  subAdmins: AdminSubAdmin[];
  busyUserId?: string | null;
  onManage: (
    subAdmin: AdminSubAdmin
  ) => void;
  onResendSetupOtp: (
    subAdmin: AdminSubAdmin
  ) => void;
}

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function formatPermission(
  permission: string
): string {
  return permission
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

export default function SubAdminTable({
  subAdmins,
  busyUserId = null,
  onManage,
  onResendSetupOtp,
}: SubAdminTableProps) {
  if (!subAdmins.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <UserCog size={22} />
        </div>

        <h3 className="mt-4 font-bold text-[#0B2D5C]">
          No sub-admins found
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
          Create a sub-admin or change the search and status filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
            <UserCog size={19} />
          </div>

          <div>
            <h2 className="font-bold text-[#0B2D5C]">
              Sub-admin Accounts
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              {subAdmins.length}{" "}
              {subAdmins.length === 1
                ? "administrator"
                : "administrators"}{" "}
              on this page
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-slate-200 bg-slate-50/80">
            <tr>
              <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 sm:px-6">
                Administrator
              </th>

              <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                Status
              </th>

              <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                Permissions
              </th>

              <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                Last Login
              </th>

              <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                Created
              </th>

              <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 sm:px-6">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {subAdmins.map((subAdmin) => {
              const busy =
                busyUserId === subAdmin.id;

              return (
                <tr
                  key={subAdmin.id}
                  className="group transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex min-w-[240px] items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-[#0B2D5C] ring-1 ring-blue-100">
                        {subAdmin.fullName
                          ?.charAt(0)
                          .toUpperCase() || "A"}
                      </div>

                      <div className="min-w-0">
                        <p className="max-w-[240px] truncate text-sm font-bold text-slate-900">
                          {subAdmin.fullName}
                        </p>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail
                            size={12}
                            className="shrink-0 text-slate-400"
                          />

                          <span className="max-w-[240px] truncate">
                            {subAdmin.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="space-y-2">
                      <SubAdminStatusBadge
                        status={subAdmin.status}
                      />

                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <ShieldCheck size={13} />

                        {subAdmin.enabled
                          ? "Sign-in enabled"
                          : "Sign-in disabled"}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex min-w-[260px] max-w-[360px] flex-wrap gap-1.5">
                      {subAdmin.permissions.map(
                        (permission) => (
                          <span
                            key={permission}
                            className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600"
                          >
                            {formatPermission(
                              permission
                            )}
                          </span>
                        )
                      )}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-500">
                    {formatDate(
                      subAdmin.lastLoginAt
                    )}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-500">
                    {formatDate(
                      subAdmin.createdAt
                    )}
                  </td>

                  <td className="px-5 py-4 text-right sm:px-6">
                    <div className="flex min-w-[210px] justify-end gap-2">
                      <button
                        type="button"
                        disabled={
                          busy ||
                          subAdmin.status !==
                            "ACTIVE"
                        }
                        title={
                          subAdmin.status ===
                          "ACTIVE"
                            ? "Resend password setup OTP"
                            : "Setup OTP is available only for active sub-admins"
                        }
                        onClick={() =>
                          onResendSetupOtp(
                            subAdmin
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0B2D5C] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <KeyRound size={13} />

                        Setup OTP
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          onManage(
                            subAdmin
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0B2D5C] shadow-sm transition hover:border-[#0B2D5C] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Settings2 size={13} />

                        Manage
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
