"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

import PresenceConnection from "@/features/chat/components/PresenceConnection";

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
   * ============================================================
   * Close Mobile Sidebar On Route Change
   * ============================================================
   */

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  /*
   * ============================================================
   * Escape Key Support
   * ============================================================
   */

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ): void {
      if (
        event.key === "Escape"
      ) {
        setMobileSidebarOpen(false);
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
   * ============================================================
   * Prevent Background Scrolling
   * ============================================================
   */

  useEffect(() => {
    if (!mobileSidebarOpen) {
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

  /*
   * ============================================================
   * Dashboard
   * ============================================================
   */

  return (
    <ProfileProvider>

      {/*
       * Keeps an authenticated WebSocket
       * connection alive throughout the
       * entire dashboard area.
       *
       * This means the user remains Online
       * while navigating Dashboard, Search,
       * Profile, Interests, Privacy and Chat.
       */}
      <PresenceConnection />

      <div className="min-h-screen bg-slate-50">

        {/*
         * ======================================================
         * Desktop Sidebar
         * ======================================================
         */}

        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-[80] lg:block lg:w-[84px]">
          <Sidebar />
        </div>

        {/*
         * ======================================================
         * Main Dashboard Area
         * ======================================================
         */}

        <div className="relative flex min-h-screen min-w-0 flex-col lg:pl-[84px]">

          <Header
            onOpenSidebar={() =>
              setMobileSidebarOpen(true)
            }
          />

          <main className="min-w-0 flex-1 p-3 sm:p-4 lg:p-5 xl:p-6">

            <div className="mx-auto w-full max-w-[1360px]">
              {children}
            </div>

          </main>

          <DashboardFooter />

        </div>

        {/*
         * ======================================================
         * Mobile Sidebar Overlay
         * ======================================================
         */}

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
              setMobileSidebarOpen(false)
            }
            className={[
              "absolute inset-0 bg-[#020817]/70 backdrop-blur-sm transition-opacity duration-300",
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
              "absolute inset-y-0 left-0 w-[90%] max-w-[320px] shadow-2xl transition-transform duration-300 ease-out",
              mobileSidebarOpen
                ? "translate-x-0"
                : "-translate-x-full",
            ].join(" ")}
          >

            <Sidebar
              mobile
              onClose={() =>
                setMobileSidebarOpen(false)
              }
            />

          </div>

        </div>

      </div>

    </ProfileProvider>
  );
}