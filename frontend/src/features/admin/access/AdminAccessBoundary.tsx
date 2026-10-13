"use client";

import {
  ReactNode,
} from "react";

import {
  useAdminAccess,
} from "./AdminAccessProvider";

interface AdminAccessBoundaryProps {
  children: ReactNode;
}

export default function AdminAccessBoundary({
  children,
}: AdminAccessBoundaryProps) {
  const {
    loading,
    error,
    refreshAccess,
  } = useAdminAccess();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0B2D5C]" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading administrator permissions...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">
            Unable to load admin access
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              void refreshAccess();
            }}
            className="mt-5 rounded-xl bg-[#0B2D5C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123D73]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
