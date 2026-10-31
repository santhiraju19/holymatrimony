"use client";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  useFranchiseAccess,
} from "../access/FranchiseAccessProvider";

import {
  getAccessibleFranchiseNavigation,
} from "./franchiseNavigation";

interface FranchiseSidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

function isActiveRoute(
  pathname: string,
  href: string
): boolean {
  if (href === "/franchise") {
    return pathname === href;
  }

  return (
    pathname === href ||
    pathname.startsWith(
      `${href}/`
    )
  );
}

export default function FranchiseSidebar({
  mobile = false,
  onNavigate,
}: FranchiseSidebarProps) {
  const pathname =
    usePathname();

  const {
    access,
  } = useFranchiseAccess();

  const navigation =
    getAccessibleFranchiseNavigation(
      access?.permissions ?? []
    );

  return (
    <aside
      className={
        mobile
          ? "flex h-full w-full flex-col bg-[#071D3A]"
          : "fixed inset-y-0 left-0 z-30 hidden w-72 flex-col bg-[#071D3A] shadow-xl lg:flex"
      }
    >
      <div className="border-b border-white/10 px-6 py-6">
        <Link
          href="/franchise"
          onClick={onNavigate}
          className="block"
        >
          <p className="text-xl font-bold text-white">
            Holy Matrimony
          </p>

          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
            Franchise Portal
          </p>
        </Link>
      </div>

      <div className="border-b border-white/10 px-6 py-5">
        <p className="truncate text-sm font-semibold text-white">
          {access?.franchiseName ??
            "Franchise"}
        </p>

        <p className="mt-1 truncate text-xs text-slate-400">
          {access
            ? `${access.districtName}, ${access.stateName}`
            : "Loading franchise scope..."}
        </p>

        {access?.franchiseCode && (
          <span className="mt-3 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-slate-200">
            {access.franchiseCode}
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Operations
        </p>

        <div className="space-y-1">
          {navigation.map(
            (item) => {
              const active =
                isActiveRoute(
                  pathname,
                  item.href
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={[
                    "flex items-center rounded-xl px-3 py-3 text-sm font-semibold transition",
                    active
                      ? "bg-white text-[#0B2D5C] shadow-sm"
                      : "text-slate-300 hover:bg-white/10 hover:text-white",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            }
          )}
        </div>

        {navigation.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm leading-6 text-slate-400">
              No portal sections are currently assigned to this account.
            </p>
          </div>
        )}
      </nav>

      <div className="border-t border-white/10 px-6 py-5">
        <p className="truncate text-sm font-semibold text-white">
          {access?.fullName ??
            "Franchise User"}
        </p>

        <p className="mt-1 truncate text-xs text-slate-400">
          {access?.email}
        </p>

        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-[#D4AF37]">
          {access?.staffRole
            .replaceAll("_", " ")
            .replace(
              "FRANCHISE ",
              ""
            )}
        </p>
      </div>
    </aside>
  );
}
