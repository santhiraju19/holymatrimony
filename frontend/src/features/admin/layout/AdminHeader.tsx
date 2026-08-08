"use client";

import { useState } from "react";

import { useAuthContext } from "@/features/auth/context/AuthContext";
import { authService } from "@/features/auth/services/auth.service";
import { clearAuthStorage } from "@/lib/auth";

export default function AdminHeader() {
  const { user } = useAuthContext();

  const [loggingOut, setLoggingOut] =
    useState(false);

  async function handleAdminLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      /*
       * Logout from backend.
       *
       * authService.logout() also clears
       * local auth storage in its finally block.
       */
      await authService.logout();
    } catch {
      /*
       * Extra safety:
       * make sure local authentication
       * is removed even if logout fails.
       */
      clearAuthStorage();
    }

    /*
     * IMPORTANT:
     *
     * Do NOT call AuthContext.logout() here.
     *
     * Updating AuthContext before navigation can
     * trigger the regular member ProtectedRoute,
     * which redirects to /login.
     *
     * A full-page replacement will recreate
     * AuthProvider from the now-cleared storage.
     */
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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B78A22]">
            Holy Matrimony
          </p>

          <h1 className="mt-1 text-lg font-bold text-slate-900">
            Admin Console
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-slate-900">
              {displayName}
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              {displayEmail}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#0B2D5C] to-blue-600 font-bold text-white shadow-md">
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
  );
}