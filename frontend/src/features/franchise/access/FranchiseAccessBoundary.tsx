"use client";

import type {
  ReactNode,
} from "react";

import {
  useFranchiseAccess,
} from "./FranchiseAccessProvider";

interface FranchiseAccessBoundaryProps {
  children: ReactNode;
}

export default function FranchiseAccessBoundary({
  children,
}: FranchiseAccessBoundaryProps) {
  const {
    access,
    loading,
    error,
    refreshAccess,
  } = useFranchiseAccess();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0B2D5C]"
            aria-hidden="true"
          />

          <h1 className="mt-5 text-lg font-semibold text-slate-900">
            Loading Franchise Portal
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            We are verifying your franchise access and permissions.
          </p>
        </div>
      </div>
    );
  }

  if (error || !access) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-600">
            !
          </div>

          <h1 className="mt-5 text-xl font-semibold text-slate-900">
            Franchise Access Unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {error ??
              "Your franchise access could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() => {
              void refreshAccess();
            }}
            className="mt-6 rounded-xl bg-[#0B2D5C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123D73]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
