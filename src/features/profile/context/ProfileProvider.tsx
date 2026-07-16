"use client";

import { ReactNode, useState } from "react";
import { ProfileContext, initialProfile } from "./ProfileContext";
import { ProfileState } from "../types";

interface ProfileProviderProps {
  children: ReactNode;
}

export default function ProfileProvider({
  children,
}: ProfileProviderProps) {
  const [profile, setProfile] = useState<ProfileState>(initialProfile);

  return (
    <ProfileContext.Provider
      value={{
        ...profile,
        setProfile,
      } as any}
    >
      {children}
    </ProfileContext.Provider>
  );
}