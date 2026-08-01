"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

import ProfileProvider from "@/features/profile/context/ProfileProvider";

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
    ) {
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
      <div className="min-h-screen bg-slate-100">
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block lg:w-72">
          <Sidebar />
        </div>

        <div className="min-w-0 lg:pl-72">
          <Header
            onOpenSidebar={() =>
              setMobileSidebarOpen(true)
            }
          />

          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-[1600px]">
              {children}
            </div>
          </main>
        </div>

        <div
          className={[
            "fixed inset-0 z-[70] lg:hidden",
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
              "absolute inset-0 bg-slate-950/55 backdrop-blur-sm transition-opacity",
              mobileSidebarOpen
                ? "opacity-100"
                : "opacity-0",
            ].join(" ")}
          />

          <div
            className={[
              "absolute inset-y-0 left-0 w-[86%] max-w-72 transition-transform duration-300",
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