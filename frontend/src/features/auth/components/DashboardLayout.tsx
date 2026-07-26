"use client";

import { ReactNode } from "react";

import ProtectedRoute from "@/features/auth/components/ProtectedRoute";

import ProfileProvider from "@/features/profile/context/ProfileProvider";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: Props) {
  return (
    <ProtectedRoute>
      <ProfileProvider>
        <div className="flex min-h-screen bg-slate-100">

          <Sidebar />

          <div className="flex flex-1 flex-col">

            <Header />

            <main className="flex-1 p-8">
              {children}
            </main>

          </div>

        </div>
      </ProfileProvider>
    </ProtectedRoute>
  );
}