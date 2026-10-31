import {
  Suspense,
} from "react";

import FranchiseLoginClient from "@/features/franchise/auth/FranchiseLoginClient";

function FranchiseLoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <div
          className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0B2D5C]"
          aria-hidden="true"
        />

        <p className="mt-4 text-sm font-medium text-slate-500">
          Loading Franchise Sign In...
        </p>
      </div>
    </div>
  );
}

export default function FranchiseLoginPage() {
  return (
    <Suspense
      fallback={
        <FranchiseLoginFallback />
      }
    >
      <FranchiseLoginClient />
    </Suspense>
  );
}
