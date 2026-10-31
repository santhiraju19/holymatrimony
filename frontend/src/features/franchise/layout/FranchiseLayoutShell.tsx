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
  X,
} from "lucide-react";

import FranchiseAccessBoundary from "../access/FranchiseAccessBoundary";
import {
  FranchiseAccessProvider,
} from "../access/FranchiseAccessProvider";
import FranchiseRouteAccessBoundary from "../access/FranchiseRouteAccessBoundary";
import FranchiseGuard from "../auth/FranchiseGuard";

import FranchiseHeader from "./FranchiseHeader";
import FranchiseSidebar from "./FranchiseSidebar";

interface FranchiseLayoutShellProps {
  children: ReactNode;
}

function FranchisePortalLayout({
  children,
}: FranchiseLayoutShellProps) {
  const pathname =
    usePathname();

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50">
      <FranchiseSidebar />

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close franchise navigation"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px]"
          />

          <div className="relative h-full w-[min(88vw,18rem)] shadow-2xl">
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close franchise navigation"
            >
              <X
                className="h-5 w-5"
                aria-hidden="true"
              />
            </button>

            <FranchiseSidebar
              mobile
              onNavigate={() =>
                setMobileMenuOpen(false)
              }
            />
          </div>
        </div>
      )}

      <div className="min-h-screen lg:pl-72">
        <FranchiseHeader
          onOpenMobileMenu={() =>
            setMobileMenuOpen(true)
          }
        />

        <main className="px-5 py-6 sm:px-7 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function FranchiseLayoutShell({
  children,
}: FranchiseLayoutShellProps) {
  const pathname =
    usePathname();

  const isLoginPage =
    pathname ===
    "/franchise/login";

  return (
    <FranchiseGuard>
      {isLoginPage ? (
        children
      ) : (
        <FranchiseAccessProvider>
          <FranchiseAccessBoundary>
            <FranchisePortalLayout>
              <FranchiseRouteAccessBoundary>
                {children}
              </FranchiseRouteAccessBoundary>
            </FranchisePortalLayout>
          </FranchiseAccessBoundary>
        </FranchiseAccessProvider>
      )}
    </FranchiseGuard>
  );
}
