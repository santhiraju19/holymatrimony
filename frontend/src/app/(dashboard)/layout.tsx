import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

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