"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

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
  const pathname = usePathname();

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ): void {
      if (event.key === "Escape") {
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
  }, [mobileSidebarOpen]);

  return (
    <ProfileProvider>
      <div className="relative min-h-screen overflow-x-hidden bg-[#F5F7FB]">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.07),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.06),transparent_35%)]" />

        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-[80] lg:block lg:w-[84px]">
          <Sidebar />
        </div>

        <div className="relative flex min-h-screen min-w-0 flex-col lg:pl-[84px]">
          <Header
            onOpenSidebar={() =>
              setMobileSidebarOpen(true)
            }
          />

          <main className="min-w-0 flex-1 p-3 sm:p-5 lg:p-6 xl:p-8">
            <div className="mx-auto w-full max-w-[1720px]">
              {children}
            </div>
          </main>

          <DashboardFooter />
        </div>

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