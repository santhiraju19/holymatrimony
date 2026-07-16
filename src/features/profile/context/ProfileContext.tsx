"use client";

import React, { createContext } from "react";
import { ProfileState } from "../types";

export interface ProfileContextType extends ProfileState {
  setProfile: React.Dispatch<React.SetStateAction<ProfileState>>;
}

export const initialProfile: ProfileState = {
  basicInfo: {
    fullName: "",
    mobile: "",
    dateOfBirth: "",
    gender: "",
  },

  churchInfo: {
    churchName: "",
    denomination: "",
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
    denomination: "",
    education: "",
  },

  photoInfo: {
    photos: [],
    primaryPhoto: "",
  },
};

export const ProfileContext = createContext<ProfileContextType>({
  ...initialProfile,
  setProfile: () => {},
});