"use client";

import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { ProfileState } from "../types";
import { useProfileRecovery } from "../hooks/useProfileRecovery";
import profileService, {
  ProfilePayload,
} from "../services/profile.service";

export interface ProfileContextType extends ProfileState {
  setProfile: React.Dispatch<
    React.SetStateAction<ProfileState>
  >;

  saveStatus: "idle" | "saving" | "saved";

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

interface Props {
  children: ReactNode;
}

function mapApiToState(
  api: ProfilePayload
): ProfileState {
  return {
    basicInfo: {
      fullName: api.fullName ?? "",
      mobile: api.mobile ?? "",
      dateOfBirth: api.dateOfBirth ?? "",
      gender: api.gender ?? "",
      age: api.age?.toString() ?? "",
      maritalStatus: api.maritalStatus ?? "",
      email: api.email ?? "",
    },

    churchInfo: {
      denomination: api.denomination ?? "",
      churchName: api.churchName ?? "",
      pastorName: api.pastorName ?? "",
      baptized: api.baptized?.toString() ?? "",
      membershipId: api.membershipId ?? "",
      churchAddress: api.churchAddress ?? "",
    },

    educationInfo: {
      highestEducation: api.highestEducation ?? "",
      profession: api.profession ?? "",
      company: api.company ?? "",
      annualIncome: api.annualIncome ?? "",
    },

    familyInfo: {
      fatherName: api.fatherName ?? "",
      motherName: api.motherName ?? "",
      siblings: api.siblings ?? "",
      familyLocation: api.familyLocation ?? "",
    },

    preferenceInfo: {
      preferredAgeFrom:
        api.preferredAgeFrom?.toString() ?? "",
      preferredAgeTo:
        api.preferredAgeTo?.toString() ?? "",
      preferredDenomination:
        api.preferredDenomination ?? "",
      preferredEducation:
        api.preferredEducation ?? "",
    },

    locationInfo: {
      city: api.city ?? "",
      state: api.state ?? "",
      country: api.country ?? "",
    },

    aboutInfo: {
      aboutMe: api.aboutMe ?? "",
    },

    photoInfo: {
      photos: [],
      primaryPhoto: "",
    },
  };
}

function mapStateToApi(
  profile: ProfileState
): ProfilePayload {
  return {
    ...profile.basicInfo,
    ...profile.churchInfo,
    ...profile.educationInfo,
    ...profile.familyInfo,
    ...profile.preferenceInfo,
    ...profile.locationInfo,
    ...profile.aboutInfo,
  };
}

export function ProfileProvider({
  children,
}: Props) {
  const [profile, setProfile] =
    useState<ProfileState>(initialProfile);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const {
    restoreDraft,
    removeDraft,
    saveStatus,
  } = useProfileRecovery(profile);

  const refreshProfile =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const apiProfile =
          await profileService.getProfile();

        setProfile(mapApiToState(apiProfile));
      } catch (err) {
        console.error(err);

        const draft = restoreDraft();

        if (draft) {
          setProfile(draft);
        } else {
          setError(
            "Unable to load your profile."
          );
        }
      } finally {
        setLoading(false);
      }
    }, [restoreDraft]);

  const saveProfile =
    useCallback(async () => {
      setSaving(true);
      setError(null);

      try {
        await profileService.updateProfile(
          mapStateToApi(profile)
        );

        removeDraft();
      } catch (err) {
        console.error(err);
        setError(
          "Unable to save your profile."
        );
      } finally {
        setSaving(false);
      }
    }, [profile, removeDraft]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <ProfileContext.Provider
      value={{
        ...profile,
        setProfile,

        saveStatus,

        loading,
        saving,
        error,

        refreshProfile,
        saveProfile,

        clearSavedDraft: removeDraft,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}