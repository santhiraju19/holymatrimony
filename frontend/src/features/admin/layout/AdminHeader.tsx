"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuthContext } from "@/features/auth/context/AuthContext";
import { authService } from "@/features/auth/services/auth.service";
import { clearAuthStorage } from "@/lib/auth";

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

  return pathname.startsWith(href);
}

export default function AdminHeader() {
  const { user } = useAuthContext();
  const pathname = usePathname();

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [mobileMenuOpen]);

  async function handleAdminLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await authService.logout();
    } catch {
      clearAuthStorage();
    }

    window.location.replace(
      "/admin/login"
    );
  }

  const displayName =
    user?.fullName?.trim() ||
    "Administrator";

  const displayEmail =
    user?.email ||
    "Admin Account";

  const initial =
    displayName
      .charAt(0)
      .toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-3 px-3 sm:h-20 sm:px-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(true)
              }
              aria-label="Open admin navigation"
              aria-expanded={mobileMenuOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[#0B2D5C] hover:text-[#0B2D5C] lg:hidden"
            >
              <span className="text-xl leading-none">
                ☰
              </span>
            </button>

            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B78A22] sm:text-xs sm:tracking-[0.2em]">
                Holy Matrimony
              </p>

              <h1 className="mt-0.5 truncate text-base font-bold text-slate-900 sm:mt-1 sm:text-lg">
                Admin Console
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-slate-900">
                {displayName}
              </p>

              <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-500">
                {displayEmail}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0B2D5C] to-blue-600 text-sm font-bold text-white shadow-md sm:h-11 sm:w-11 sm:text-base">
              {initial}
            </div>

            <button
              type="button"
              disabled={loggingOut}
              onClick={handleAdminLogout}
              className="hidden rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:inline-flex"
            >
              {loggingOut
                ? "Signing out..."
                : "Sign Out"}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close admin navigation"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
          />

          <aside className="absolute inset-y-0 left-0 flex w-[86vw] max-w-[320px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
              <Link
                href="/admin"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="min-w-0"
              >
                <div className="truncate text-lg font-bold text-[#0B2D5C]">
                  Holy Matrimony
                </div>

                <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B78A22]">
                  Administration
                </div>
              </Link>

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                aria-label="Close admin navigation"
                className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-xl text-slate-600 transition hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0B2D5C] to-blue-600 font-bold text-white">
                  {initial}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {displayName}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {displayEmail}
                  </p>
                </div>
              </div>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
              {navigation.map((item) => {
                const active =
                  isActive(
                    pathname,
                    item.href
                  );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() =>
                      setMobileMenuOpen(
                        false
                      )
                    }
                    className={[
                      "flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
                      active
                        ? "bg-[#0B2D5C] text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#0B2D5C]",
                    ].join(" ")}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-base">
                      {item.icon}
                    </span>

                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="space-y-3 border-t border-slate-100 p-4">
              <Link
                href="/"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#0B2D5C] hover:text-[#0B2D5C]"
              >
                ← Back to Website
              </Link>

              <button
                type="button"
                disabled={loggingOut}
                onClick={handleAdminLogout}
                className="flex w-full items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loggingOut
                  ? "Signing out..."
                  : "Sign Out"}
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}