"use client";

import React, {
  createContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { ProfileState } from "../types";
import { useProfileRecovery } from "../hooks/useProfileRecovery";

export interface ProfileContextType extends ProfileState {
  setProfile: React.Dispatch<
    React.SetStateAction<ProfileState>
  >;

  saveStatus: "idle" | "saving" | "saved";

  clearSavedDraft: () => void;
}

export const initialProfile: ProfileState = {
  basicInfo: {
    fullName: "",
    mobile: "",
    dateOfBirth: "",
    gender: "",
    age: "",
    maritalStatus: "",
    email: "",
  },

  churchInfo: {
    denomination: "",
    churchName: "",
    pastorName: "",
    baptized: "",
    membershipId: "",
    churchAddress: "",
  },

  educationInfo: {
    highestEducation: "",
    profession: "",
    company: "",
    annualIncome: "",
  },

  familyInfo: {
    fatherName: "",
    motherName: "",
    siblings: "",
    familyLocation: "",
  },

  preferenceInfo: {
    preferredAgeFrom: "",
    preferredAgeTo: "",
    preferredDenomination: "",
    preferredEducation: "",
  },

  locationInfo: {
    city: "",
    state: "",
    country: "",
  },

  aboutInfo: {
    aboutMe: "",
  },

  photoInfo: {
    photos: [],
    primaryPhoto: "",
  },
};

export const ProfileContext =
  createContext<ProfileContextType>({
    ...initialProfile,
    setProfile: () => {},
    saveStatus: "idle",
    clearSavedDraft: () => {},
  });

interface Props {
  children: ReactNode;
}

export function ProfileProvider({
  children,
}: Props) {
  const [profile, setProfile] =
    useState<ProfileState>(initialProfile);

  const {
    restoreDraft,
    removeDraft,
    saveStatus,
  } = useProfileRecovery(profile);

  /**
   * Restore profile on first load
   */
  useEffect(() => {
    const draft = restoreDraft();

    if (draft) {
      setProfile(draft);
    }
  }, [restoreDraft]);

  return (
    <ProfileContext.Provider
      value={{
        ...profile,
        setProfile,
        saveStatus,
        clearSavedDraft: removeDraft,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}