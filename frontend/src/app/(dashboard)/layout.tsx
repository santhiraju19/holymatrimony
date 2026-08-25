import type {
  Metadata,
} from "next";

import ProtectedRoute from "@/features/auth/components/ProtectedRoute";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
