"use client";

import { ReactNode } from "react";

import { AuthProvider } from "@/features/auth/context/AuthContext";
import SecureConnectOverlay from "@/features/secure-connect/components/SecureConnectOverlay";
import { SecureConnectProvider } from "@/features/secure-connect/context/SecureConnectContext";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({
  children,
}: ProvidersProps) {
  return (
    <AuthProvider>
      <SecureConnectProvider>
        <SecureConnectOverlay />
        {children}
      </SecureConnectProvider>
    </AuthProvider>
  );
}
