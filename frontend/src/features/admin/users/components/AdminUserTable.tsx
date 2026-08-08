"use client";

import Link from "next/link";

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
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <h3 className="font-semibold text-slate-900">
          No users found
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Try changing the search or status filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Member
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Contact
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Role
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Verified
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Joined
              </th>

              <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr
                key={user.id}
                className="transition hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 font-bold text-[#0B2D5C]">
                      {user.fullName
                        ?.charAt(0)
                        .toUpperCase() || "U"}
                    </div>

                    <div>
                      <p className="whitespace-nowrap text-sm font-semibold text-slate-900">
                        {user.fullName}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {user.id.slice(0, 8)}…
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <p className="whitespace-nowrap text-sm text-slate-700">
                    {user.email}
                  </p>

                  <p className="mt-1 whitespace-nowrap text-xs text-slate-400">
                    {user.mobile || "No mobile"}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <span className="whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {user.role === "ROLE_ADMIN"
                      ? "Admin"
                      : "User"}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <UserStatusBadge
                    status={user.status}
                  />
                </td>

                <td className="px-5 py-4">
                  <span
                    className={
                      user.emailVerified
                        ? "text-sm font-semibold text-emerald-600"
                        : "text-sm font-semibold text-amber-600"
                    }
                  >
                    {user.emailVerified
                      ? "Verified"
                      : "Pending"}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                  {formatDate(user.createdAt)}
                </td>

                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="inline-flex rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#0B2D5C] transition hover:border-[#0B2D5C] hover:bg-blue-50"
                  >
                    View
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