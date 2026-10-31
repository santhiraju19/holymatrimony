"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

import {
  getToken,
} from "@/lib/auth";

import {
  isFranchiseToken,
} from "./franchiseAuth";

interface FranchiseGuardProps {
  children: ReactNode;
}

export default function FranchiseGuard({
  children,
}: FranchiseGuardProps) {
  const pathname =
    usePathname();

  const [
    checking,
    setChecking,
  ] = useState(true);

  const isLoginPage =
    pathname ===
    "/franchise/login";

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    const token =
      getToken();

    if (
      !isFranchiseToken(token)
    ) {
      const redirect =
        encodeURIComponent(
          pathname
        );

      window.location.replace(
        `/franchise/login?redirect=${redirect}`
      );

      return;
    }

    setChecking(false);
  }, [
    pathname,
    isLoginPage,
  ]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0B2D5C]"
            aria-hidden="true"
          />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Verifying franchise access...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
