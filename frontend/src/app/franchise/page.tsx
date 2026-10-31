"use client";

import {
  Building2,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useFranchiseAccess,
} from "@/features/franchise/access/FranchiseAccessProvider";

function formatStaffRole(
  value: string
): string {
  return value
    .replaceAll("_", " ")
    .replace(
      "FRANCHISE ",
      ""
    );
}

export default function FranchiseDashboardPage() {
  const {
    access,
    hasPermission,
  } = useFranchiseAccess();

  if (
    !access ||
    !hasPermission(
      "DASHBOARD_VIEW"
    )
  ) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-lg font-bold text-amber-900">
          Dashboard Access Restricted
        </h1>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          Your franchise account does not currently have permission to view the dashboard.
        </p>
      </section>
    );
  }

  const staffRole =
    formatStaffRole(
      access.staffRole
    );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B2D5C] to-[#123D73] p-6 text-white shadow-lg sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            Franchise Dashboard
          </p>

          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
            Welcome, {access.fullName}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
            Manage your authorized Holy Matrimony franchise operations within your assigned district and portal permissions.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
            <Building2
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Franchise
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {access.franchiseName}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {access.franchiseCode}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
            <MapPin
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Assigned District
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {access.districtName}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {access.stateName}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
            <UserRound
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Staff Role
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {staffRole}
          </p>

          <p className="mt-1 truncate text-sm text-slate-500">
            {access.email}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
            <ShieldCheck
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Portal Access
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {access.permissions.length} Permissions
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Database-authorized access
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Geographic Scope
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your operational access is restricted to the district assigned to this franchise.
          </p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                State
              </dt>

              <dd className="mt-1 font-semibold text-slate-900">
                {access.stateName}
              </dd>

              <dd className="mt-1 text-xs text-slate-500">
                LGD {access.stateLgdCode}
              </dd>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                District
              </dt>

              <dd className="mt-1 font-semibold text-slate-900">
                {access.districtName}
              </dd>

              <dd className="mt-1 text-xs text-slate-500">
                LGD {access.districtLgdCode}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Access Summary
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Portal sections are shown according to the permissions assigned to your franchise account.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {access.permissions.map(
              (permission) => (
                <span
                  key={permission}
                  className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#0B2D5C]"
                >
                  {permission
                    .replaceAll(
                      "_",
                      " "
                    )
                    .toLowerCase()
                    .replace(
                      /\b\w/g,
                      (letter) =>
                        letter.toUpperCase()
                    )}
                </span>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
