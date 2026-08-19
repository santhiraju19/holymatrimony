"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

import PresenceConnection from "@/features/chat/components/PresenceConnection";

import {
  NotificationProvider,
} from "@/features/notifications/context/NotificationContext";

import ProfileProvider from "@/features/profile/context/ProfileProvider";

import DashboardFooter from "./DashboardFooter";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const pathname =
    usePathname();

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  /*
   * Close mobile navigation whenever
   * the route changes.
   */
  useEffect(() => {
    setMobileSidebarOpen(
      false
    );
  }, [pathname]);

  /*
   * Escape-key support.
   */
  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ): void {
      if (
        event.key ===
        "Escape"
      ) {
        setMobileSidebarOpen(
          false
        );
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  /*
   * Prevent background scrolling while
   * the mobile navigation is open.
   */
  useEffect(() => {
    if (
      !mobileSidebarOpen
    ) {
      document.body.style.overflow =
        "";

      return;
    }

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [
    mobileSidebarOpen,
  ]);

  return (
    <ProfileProvider>
      <NotificationProvider>
        <PresenceConnection />

      <div className="relative min-h-screen overflow-x-hidden bg-[#F7F9FC]">

        {/* =====================================================
            Premium Global Background
            ===================================================== */}

        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0"
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#F8FAFD_0%,#F7F9FC_45%,#F8FAFC_100%)]" />

          <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-blue-200/20 blur-[110px]" />

          <div className="absolute right-[-180px] top-[18%] h-[520px] w-[520px] rounded-full bg-indigo-200/20 blur-[120px]" />

          <div className="absolute bottom-[-220px] left-[28%] h-[520px] w-[520px] rounded-full bg-amber-100/25 blur-[120px]" />

          <div
            className="absolute inset-0 opacity-[0.022]"
            style={{
              backgroundImage:
                "radial-gradient(#0B2D5C 0.7px, transparent 0.7px)",
              backgroundSize:
                "24px 24px",
            }}
          />
        </div>

        {/* =====================================================
            Desktop Sidebar
            ===================================================== */}

        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-[80] lg:block lg:w-[84px]">
          <Sidebar />
        </div>

        {/* =====================================================
            Main Application Area
            ===================================================== */}

        <div className="relative z-10 flex min-h-screen min-w-0 flex-col lg:pl-[84px]">
          <Header
            onOpenSidebar={() =>
              setMobileSidebarOpen(
                true
              )
            }
          />

          <main className="min-w-0 flex-1 px-3 pb-8 pt-4 sm:px-4 sm:pt-5 lg:px-6 lg:pb-10 lg:pt-6 xl:px-8">
            <div className="mx-auto w-full max-w-[1440px]">
              {children}
            </div>
          </main>

          <DashboardFooter />
        </div>

        {/* =====================================================
            Mobile Sidebar
            ===================================================== */}

        <div
          className={[
            "fixed inset-0 z-[100] lg:hidden",
            mobileSidebarOpen
              ? "pointer-events-auto"
              : "pointer-events-none",
          ].join(" ")}
          aria-hidden={
            !mobileSidebarOpen
          }
        >
          <button
            type="button"
            aria-label="Close dashboard menu"
            onClick={() =>
              setMobileSidebarOpen(
                false
              )
            }
            className={[
              "absolute inset-0 bg-[#020817]/70 backdrop-blur-md",
              "transition-opacity duration-300",
              mobileSidebarOpen
                ? "opacity-100"
                : "opacity-0",
            ].join(" ")}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard navigation"
            className={[
              "absolute inset-y-0 left-0 w-[90%] max-w-[320px]",
              "shadow-[0_30px_80px_rgba(2,8,23,0.35)]",
              "transition-transform duration-300 ease-out",
              mobileSidebarOpen
                ? "translate-x-0"
                : "-translate-x-full",
            ].join(" ")}
          >
            <Sidebar
              mobile
              onClose={() =>
                setMobileSidebarOpen(
                  false
                )
              }
            />
          </div>
        </div>
      </div>
      </NotificationProvider>
    </ProfileProvider>
  );
}