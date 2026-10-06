"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ExternalLink,
  HeartHandshake,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { useAuthContext } from "@/features/auth/context/AuthContext";
import { authService } from "@/features/auth/services/auth.service";
import { clearAuthStorage } from "@/lib/auth";

import {
  adminNavigation,
  isAdminNavigationActive,
} from "./adminNavigation";

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
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-3 px-3 sm:h-20 sm:px-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(true)
              }
              aria-label="Open admin navigation"
              aria-expanded={mobileMenuOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#0B2D5C]/30 hover:bg-slate-50 hover:text-[#0B2D5C] lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-[#B78A22] sm:text-xs">
                Administration
              </p>

              <p className="mt-0.5 truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                Holy Matrimony
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-slate-900">
                {displayName}
              </p>

              <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-500">
                {displayEmail}
              </p>
            </div>

            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B2D5C] text-sm font-bold text-white shadow-sm ring-2 ring-slate-100 sm:h-10 sm:w-10"
              aria-hidden="true"
            >
              {initial}
            </div>

            <button
              type="button"
              disabled={loggingOut}
              onClick={handleAdminLogout}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:inline-flex"
            >
              <LogOut size={16} />

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

          <aside className="absolute inset-y-0 left-0 flex w-[88vw] max-w-[330px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
              <Link
                href="/admin"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="flex min-w-0 items-center gap-3 rounded-xl p-1"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B2D5C] text-white">
                  <HeartHandshake
                    size={20}
                    strokeWidth={2}
                  />
                </div>

                <div className="min-w-0">
                  <div className="truncate text-base font-bold text-[#0B2D5C]">
                    Holy Matrimony
                  </div>

                  <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#B78A22]">
                    Admin Console
                  </div>
                </div>
              </Link>

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                aria-label="Close admin navigation"
                className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="border-b border-slate-100 px-4 py-4">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B2D5C] font-bold text-white">
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

            <nav className="flex-1 overflow-y-auto px-4 py-5">
              <div className="space-y-6">
                {adminNavigation.map((group) => (
                  <div key={group.label}>
                    <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      {group.label}
                    </p>

                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const active =
                          isAdminNavigationActive(
                            pathname,
                            item.href
                          );

                        const Icon = item.icon;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            aria-current={
                              active
                                ? "page"
                                : undefined
                            }
                            onClick={() =>
                              setMobileMenuOpen(
                                false
                              )
                            }
                            className={[
                              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                              active
                                ? "bg-[#0B2D5C] text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-100 hover:text-[#0B2D5C]",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                                active
                                  ? "bg-white/10 text-white"
                                  : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-[#0B2D5C]",
                              ].join(" ")}
                            >
                              <Icon
                                size={18}
                                strokeWidth={2}
                              />
                            </span>

                            <span className="truncate">
                              {item.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </nav>

            <div className="space-y-2 border-t border-slate-100 p-4">
              <Link
                href="/"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-[#0B2D5C]"
              >
                <span>Back to Website</span>
                <ExternalLink size={16} />
              </Link>

              <button
                type="button"
                disabled={loggingOut}
                onClick={handleAdminLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut size={16} />

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
