"use client";

import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type {
  AdminUser,
} from "../types/adminUser";

import UserStatusBadge from "./UserStatusBadge";

interface AdminUserTableProps {
  users: AdminUser[];
}

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(value));
}

export function AdminUserTable({
  users,
}: AdminUserTableProps) {
  if (!users?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <UserRound size={22} />
        </div>

        <h3 className="mt-4 font-bold text-[#0B2D5C]">
          No users found
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
          Try changing the search term or account status filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
            <UserRound size={19} />
          </div>

          <div>
            <h2 className="font-bold text-[#0B2D5C]">
              Member Accounts
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              {users.length} {users.length === 1 ? "member" : "members"} on this page
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-slate-200 bg-slate-50/80">
            <tr>
              <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 sm:px-6">
                Member
              </th>

              <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                Contact
              </th>

              <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                Role
              </th>

              <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                Status
              </th>

              <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                Email
              </th>

              <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                Joined
              </th>

              <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 sm:px-6">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr
                key={user.id}
                className="group transition-colors hover:bg-slate-50/80"
              >
                <td className="px-5 py-4 sm:px-6">
                  <div className="flex min-w-[190px] items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-[#0B2D5C] ring-1 ring-blue-100">
                      {user.fullName
                        ?.charAt(0)
                        .toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0">
                      <p className="max-w-[220px] truncate text-sm font-bold text-slate-900">
                        {user.fullName}
                      </p>

                      <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                        {user.id.slice(0, 8)}…
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="min-w-[220px] space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Mail
                        size={14}
                        className="shrink-0 text-slate-400"
                      />
                      <span className="max-w-[240px] truncate">
                        {user.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone
                        size={13}
                        className="shrink-0 text-slate-400"
                      />
                      <span>
                        {user.mobile || "No mobile"}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                    {user.role === "ROLE_ADMIN" ? (
                      <ShieldCheck size={13} />
                    ) : (
                      <UserRound size={13} />
                    )}

                    {user.role === "ROLE_ADMIN"
                      ? "Admin"
                      : "User"}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <UserStatusBadge status={user.status} />
                </td>

                <td className="px-5 py-4">
                  {user.emailVerified ? (
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={13} />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      <Clock3 size={13} />
                      Pending
                    </span>
                  )}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-500">
                  {formatDate(user.createdAt)}
                </td>

                <td className="px-5 py-4 text-right sm:px-6">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0B2D5C] shadow-sm transition group-hover:border-blue-200 hover:border-[#0B2D5C] hover:bg-blue-50"
                  >
                    View
                    <ArrowRight size={13} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUserTable;