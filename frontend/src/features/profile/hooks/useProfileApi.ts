"use client";

import { useCallback, useState } from "react";

import { useProfile } from "../context/useProfile";
import profileService from "../services/profile.service";

export function useProfileApi() {
  const { setProfile } = useProfile();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const data = await profileService.getProfile();

      if (!data) {
        setError("Profile data was not found.");
        return;
      }

      setProfile((previous) => ({
        ...previous,

        basicInfo: {
          ...previous.basicInfo,
          fullName: data.fullName ?? "",
          email: data.email ?? "",
          mobile: data.mobile ?? "",
          dateOfBirth: data.dateOfBirth ?? "",
          gender: data.gender ?? "",
          age:
            data.age !== undefined && data.age !== null
              ? String(data.age)
              : "",
          maritalStatus: data.maritalStatus ?? "",
        },

        churchInfo: {
          ...previous.churchInfo,
          denomination: data.denomination ?? "",
          churchName: data.churchName ?? "",
          pastorName: data.pastorName ?? "",
          baptized:
  data.baptized === true
    ? "true"
    : data.baptized === false
      ? "false"
      : "",
          membershipId: data.membershipId ?? "",
          churchAddress: data.churchAddress ?? "",
        },

        educationInfo: {
          ...previous.educationInfo,
          highestEducation: data.highestEducation ?? "",
          profession: data.profession ?? "",
          company: data.company ?? "",
          annualIncome: data.annualIncome ?? "",
        },

        familyInfo: {
          ...previous.familyInfo,
          fatherName: data.fatherName ?? "",
          motherName: data.motherName ?? "",
          siblings: data.siblings ?? "",
          familyLocation: data.familyLocation ?? "",
        },

       preferenceInfo: {
  ...previous.preferenceInfo,
  preferredAgeFrom:
    data.preferredAgeFrom !== undefined &&
    data.preferredAgeFrom !== null
      ? String(data.preferredAgeFrom)
      : "",
  preferredAgeTo:
    data.preferredAgeTo !== undefined &&
    data.preferredAgeTo !== null
      ? String(data.preferredAgeTo)
      : "",
  preferredDenomination:
    data.preferredDenomination ?? "",
  preferredEducation:
    data.preferredEducation ?? "",
},

        locationInfo: {
          ...previous.locationInfo,
          city: data.city ?? "",
          state: data.state ?? "",
          country: data.country ?? "",
        },

        aboutInfo: {
          ...previous.aboutInfo,
          aboutMe: data.aboutMe ?? "",
        },
      }));
    } catch (error: unknown) {
      console.error("Unable to load profile:", error);

      setError(
        error instanceof Error && error.message
          ? error.message
          : "Unable to load profile.",
      );
    } finally {
      setLoading(false);
    }
  }, [setProfile]);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    loadProfile,
    clearError,
  };
}