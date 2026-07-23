"use client";

import { ReactNode } from "react";
import { ProfileProvider as ContextProfileProvider } from "./ProfileContext";

interface ProfileProviderProps {
  children: ReactNode;
}

export default function ProfileProvider({
  children,
}: ProfileProviderProps) {
  return (
    <ContextProfileProvider>
      {children}
    </ContextProfileProvider>
  );
}
