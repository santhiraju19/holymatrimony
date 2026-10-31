"use client";

import {
  useState,
} from "react";

import {
  Menu,
  LogOut,
} from "lucide-react";

import {
  authService,
} from "@/features/auth/services/auth.service";

import {
  useFranchiseAccess,
} from "../access/FranchiseAccessProvider";

interface FranchiseHeaderProps {
  onOpenMobileMenu: () => void;
}

export default function FranchiseHeader({
  onOpenMobileMenu,
}: FranchiseHeaderProps) {
  const {
    access,
  } = useFranchiseAccess();

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await authService.logout();
    } finally {
      window.location.replace(
        "/franchise/login"
      );
    }
  }

  const staffRole =
    access?.staffRole
      .replaceAll("_", " ")
      .replace(
        "FRANCHISE ",
        ""
      );

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-20 items-center justify-between gap-4 px-5 sm:px-7 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
            aria-label="Open franchise navigation"
          >
            <Menu
              className="h-5 w-5"
              aria-hidden="true"
            />
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
              {access?.franchiseName ??
                "Franchise Portal"}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">
              {access
                ? `${access.districtName}, ${access.stateName}`
                : "Holy Matrimony"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="max-w-48 truncate text-sm font-semibold text-slate-900">
              {access?.fullName ??
                "Franchise User"}
            </p>

            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {staffRole ??
                "Franchise Staff"}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B2D5C] text-sm font-bold text-white">
            {access?.fullName
              ?.trim()
              .charAt(0)
              .toUpperCase() || "F"}
          </div>

          <button
            type="button"
            onClick={() => {
              void handleLogout();
            }}
            disabled={loggingOut}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Sign out of franchise portal"
          >
            <LogOut
              className="h-4 w-4"
              aria-hidden="true"
            />

            <span className="hidden md:inline">
              {loggingOut
                ? "Signing Out..."
                : "Sign Out"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
