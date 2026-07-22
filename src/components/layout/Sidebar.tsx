"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-6">
      <h2 className="mb-8 text-xl font-bold text-[#0B2D5C]">
        Holy Matrimony
      </h2>

      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className="block rounded-lg px-4 py-2 hover:bg-slate-100"
        >
          Dashboard
        </Link>

        <Link
          href="/profile"
          className="block rounded-lg px-4 py-2 hover:bg-slate-100"
        >
          My Profile
        </Link>

        <Link
          href="/matches"
          className="block rounded-lg px-4 py-2 hover:bg-slate-100"
        >
          Matches
        </Link>

        <Link
          href="/settings"
          className="block rounded-lg px-4 py-2 hover:bg-slate-100"
        >
          Settings
        </Link>
      </nav>
    </aside>
  );
}
