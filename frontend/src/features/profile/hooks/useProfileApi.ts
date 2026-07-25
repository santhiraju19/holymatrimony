"use client";

import { useCallback, useEffect, useState } from "react";

import { useProfile } from "@/features/profile/context/useProfile";
import profileService from "@/features/profile/services/profile.service";

export function useProfileApi() {
  const { setProfile, ...profile } = useProfile();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await profileService.getProfile();

      setProfile((prev) => ({
        ...prev,

        basicInfo: {
          ...prev.basicInfo,
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
          ...prev.churchInfo,
          denomination: data.denomination ?? "",
          churchName: data.churchName ?? "",
          pastorName: data.pastorName ?? "",
          baptized: data.baptized ?? "",
          membershipId: data.membershipId ?? "",
          churchAddress: data.churchAddress ?? "",
        },

        educationInfo: {
          ...prev.educationInfo,
          highestEducation: data.highestEducation ?? "",
          profession: data.profession ?? "",
          company: data.company ?? "",
          annualIncome: data.annualIncome ?? "",
        },

        familyInfo: {
          ...prev.familyInfo,
          fatherName: data.fatherName ?? "",
          motherName: data.motherName ?? "",
          siblings: data.siblings ?? "",
          familyLocation: data.familyLocation ?? "",
        },

        preferenceInfo: {
          ...prev.preferenceInfo,
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
          ...prev.locationInfo,
          city: data.city ?? "",
          state: data.state ?? "",
          country: data.country ?? "",
        },

        aboutInfo: {
          ...prev.aboutInfo,
          aboutMe: data.aboutMe ?? "",
        },
      }));
    } catch (err) {
      console.error("Failed to load profile", err);
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [setProfile]);

  const saveProfile = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);

      await profileService.updateProfile({
        fullName: profile.basicInfo.fullName,
        email: profile.basicInfo.email,

        mobile: profile.basicInfo.mobile,

        dateOfBirth: profile.basicInfo.dateOfBirth || undefined,

        gender: profile.basicInfo.gender,

        age: profile.basicInfo.age
          ? Number(profile.basicInfo.age)
          : undefined,

        maritalStatus: profile.basicInfo.maritalStatus,

        denomination: profile.churchInfo.denomination,
        churchName: profile.churchInfo.churchName,
        pastorName: profile.churchInfo.pastorName,

        baptized:
          profile.churchInfo.baptized === true ||
          profile.churchInfo.baptized === "true",

        membershipId: profile.churchInfo.membershipId,
        churchAddress: profile.churchInfo.churchAddress,

        highestEducation:
          profile.educationInfo.highestEducation,

        profession:
          profile.educationInfo.profession,

        company:
          profile.educationInfo.company,

        annualIncome:
          profile.educationInfo.annualIncome,

        fatherName:
          profile.familyInfo.fatherName,

        motherName:
          profile.familyInfo.motherName,

        siblings:
          profile.familyInfo.siblings,

        familyLocation:
          profile.familyInfo.familyLocation,

        preferredAgeFrom:
          profile.preferenceInfo.preferredAgeFrom
            ? Number(
                profile.preferenceInfo.preferredAgeFrom
              )
            : undefined,

        preferredAgeTo:
          profile.preferenceInfo.preferredAgeTo
            ? Number(
                profile.preferenceInfo.preferredAgeTo
              )
            : undefined,

        preferredDenomination:
          profile.preferenceInfo
            .preferredDenomination,

        preferredEducation:
          profile.preferenceInfo
            .preferredEducation,

        city: profile.locationInfo.city,
        state: profile.locationInfo.state,
        country: profile.locationInfo.country,

        aboutMe: profile.aboutInfo.aboutMe,
      });

      // Reload profile after successful save
      await loadProfile();
    } catch (err) {
      console.error("Failed to save profile", err);
      setError("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }, [profile, loadProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    loading,
    saving,
    error,
    loadProfile,
    saveProfile,
  };
}