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
  isAdminToken,
} from "./adminAuth";

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({
  children,
}: AdminGuardProps) {
  const pathname =
    usePathname();

  const [
    checking,
    setChecking,
  ] = useState(true);

  const isLoginPage =
    pathname ===
    "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    const token =
      getToken();

    if (
      !isAdminToken(token)
    ) {
      const redirect =
        encodeURIComponent(
          pathname
        );

      window.location.replace(
        `/admin/login?redirect=${redirect}`
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
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0B2D5C]" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Verifying administrator access...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}