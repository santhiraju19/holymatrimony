import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-sm font-semibold text-[#B78A22]">
          Administration
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Welcome to Holy Matrimony Admin
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Manage members, profiles,
          memberships, payments,
          verification and platform
          activity.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/admin/users"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
            👥
          </div>

          <h2 className="font-bold text-slate-900">
            User Management
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Search, review and manage
            registered members.
          </p>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-xl">
            ♡
          </div>

          <h2 className="font-bold text-slate-900">
            Profile Verification
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Coming in the next admin
            sprint.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl">
            ♛
          </div>

          <h2 className="font-bold text-slate-900">
            Memberships
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Membership management will
            be added shortly.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-xl">
            ₹
          </div>

          <h2 className="font-bold text-slate-900">
            Payments
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Revenue and transactions
            will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}