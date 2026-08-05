"use client";

import type {
  ReactNode,
} from "react";

import {
  usePathname,
} from "next/navigation";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

interface AppChromeProps {
  children: ReactNode;
}

const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
];

const standaloneDashboardRoutes = [
  "/profile",
  "/search",
  "/chat",
  "/received-interests",
  "/privacy",
];

function matchesRoute(
  pathname: string,
  route: string
): boolean {
  return (
    pathname === route ||
    pathname.startsWith(
      `${route}/`
    )
  );
}

export default function AppChrome({
  children,
}: AppChromeProps) {
  const pathname = usePathname();

  const authPage =
    authRoutes.some((route) =>
      matchesRoute(
        pathname,
        route
      )
    );

  const dashboardPage =
    pathname === "/dashboard" ||
    pathname.startsWith(
      "/dashboard/"
    ) ||
    standaloneDashboardRoutes.some(
      (route) =>
        matchesRoute(
          pathname,
          route
        )
    );

  if (authPage || dashboardPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="min-w-0 flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}