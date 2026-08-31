"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "▦",
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: "👥",
  },
  {
    label: "Profiles",
    href: "/admin/profiles",
    icon: "♡",
  },
  {
    label: "Trust & Verification",
    href: "/admin/verifications",
    icon: "✓",
  },
  {
    label: "Memberships",
    href: "/admin/memberships",
    icon: "♛",
  },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: "₹",
  },
  {
    label: "Churches",
    href: "/admin/churches",
    icon: "✝",
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: "▥",
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: "◫",
  },
];

function isActive(
  pathname: string,
  href: string
) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname.startsWith(
    href
  );
}

export default function AdminSidebar() {
  const pathname =
    usePathname();

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b border-slate-100 px-7 py-7">
          <Link
            href="/admin"
            className="block"
          >
            <div className="text-xl font-bold text-[#0B2D5C]">
              Holy Matrimony
            </div>

            <div className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#B78A22]">
              Administration
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          {navigation.map(
            (item) => {
              const active =
                isActive(
                  pathname,
                  item.href
                );

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  className={[
                    "flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
                    active
                      ? "bg-[#0B2D5C] text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#0B2D5C]",
                  ].join(" ")}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-base">
                    {
                      item.icon
                    }
                  </span>

                  {
                    item.label
                  }
                </Link>
              );
            }
          )}
        </nav>

        <div className="border-t border-slate-100 p-5">
          <Link
            href="/"
            className="flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#0B2D5C] hover:text-[#0B2D5C]"
          >
            ← Back to Website
          </Link>
        </div>
      </div>
    </aside>
  );
}