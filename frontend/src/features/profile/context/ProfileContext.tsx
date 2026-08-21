
"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
} from "react";

import {
  ProfileState,
} from "../types";

export interface ProfileContextType
  extends ProfileState {
  setProfile: Dispatch<
    SetStateAction<ProfileState>
  >;

  saveStatus:
    | "idle"
    | "saving"
    | "saved";

  loading: boolean;
  saving: boolean;
  error: string | null;

  refreshProfile: () => Promise<void>;

  saveProfile: () => Promise<boolean>;

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

    heightCm: "",
    weightKg: "",
    complexion: "",
    bodyType: "",
    motherTongue: "",
    religion: "",
    community: "",
    subCommunity: "",
    faithBackground: "",
    physicalStatus: "",

    diet: "",
    smoking: "",
    drinking: "",
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
    educationField: "",
    profession: "",
    company: "",
    annualIncome: "",
  },

  familyInfo: {
    fatherName: "",
    motherName: "",
    siblings: "",
    familyLocation: "",
    familyType: "",
    familyValues: "",
  },

  preferenceInfo: {
    preferredAgeFrom: "",
    preferredAgeTo: "",

    preferredHeightFromCm: "",
    preferredHeightToCm: "",

    preferredReligion: "",
    preferredDenomination: "",
    preferredMaritalStatus: "",

    preferredCommunity: "",
    communityNoBar: true,

    preferredMotherTongue: "",

    preferredEducation: "",
    preferredProfession: "",

    preferredCountry: "",
    preferredState: "",
    preferredCity: "",

    preferredDiet: "",
    preferredSmoking: "",
    preferredDrinking: "",

    preferredFaithCommitment: "",
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

    saveProfile: async () => false,

    clearSavedDraft: () => {},
  });