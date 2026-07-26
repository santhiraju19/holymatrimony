"use client";

import {
  createContext,
} from "react";

import { ProfileState } from "../types";

export interface ProfileContextType
  extends ProfileState {

  setProfile: React.Dispatch<
    React.SetStateAction<ProfileState>
  >;

  saveStatus:
    | "idle"
    | "saving"
    | "saved";

  loading: boolean;

  saving: boolean;

  error: string | null;

  refreshProfile: () => Promise<void>;

  saveProfile: () => Promise<void>;

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

    loading: false,

    saving: false,

    error: null,

    refreshProfile: async () => {},

    saveProfile: async () => {},

    clearSavedDraft: () => {},

  });