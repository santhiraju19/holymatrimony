"use client";

import React, {
  createContext,
  useState,
  ReactNode,
} from "react";

import { ProfileState } from "../types";

export interface ProfileContextType extends ProfileState {
  setProfile: React.Dispatch<
    React.SetStateAction<ProfileState>
  >;
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
  });

interface Props {
  children: ReactNode;
}

export function ProfileProvider({
  children,
}: Props) {
  const [profile, setProfile] =
    useState<ProfileState>(initialProfile);

  return (
    <ProfileContext.Provider
      value={{
        ...profile,
        setProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}