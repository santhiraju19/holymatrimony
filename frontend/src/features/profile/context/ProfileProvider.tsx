"use client";

import React, {
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ProfileContext,
  initialProfile,
} from "./ProfileContext";

import { ProfileState } from "../types";

import { useProfileRecovery } from "../hooks/useProfileRecovery";

import profileService, {
  ProfilePayload,
} from "../services/profile.service";

interface Props {
  children: ReactNode;
}

function mapApiToState(
  api: ProfilePayload
): ProfileState {
  const photos: ProfileState["photoInfo"]["photos"] = [];

  return {
    basicInfo: {
      fullName: api.fullName ?? "",
      mobile: api.mobile ?? "",
      dateOfBirth: api.dateOfBirth ?? "",
      gender: api.gender ?? "",
      age: api.age?.toString() ?? "",
      maritalStatus: api.maritalStatus ?? "",
      email: api.email ?? "",

      heightCm:
        api.heightCm?.toString() ?? "",

      weightKg:
        api.weightKg?.toString() ?? "",

      complexion:
        api.complexion ?? "",

      bodyType:
        api.bodyType ?? "",

      motherTongue:
        api.motherTongue ?? "",

      religion:
        api.religion ?? "",

      community:
        api.community ?? "",

      subCommunity:
        api.subCommunity ?? "",

      faithBackground:
        api.faithBackground ?? "",

      physicalStatus:
        api.physicalStatus ?? "",

      diet:
        api.diet ?? "",

      smoking:
        api.smoking ?? "",

      drinking:
        api.drinking ?? "",
    },

    churchInfo: {
      denomination:
        api.denomination ?? "",

      churchName:
        api.churchName ?? "",

      pastorName:
        api.pastorName ?? "",

      baptized:
        api.baptized === undefined ||
        api.baptized === null
          ? ""
          : String(api.baptized),

      membershipId:
        api.membershipId ?? "",

      churchAddress:
        api.churchAddress ?? "",
    },

    educationInfo: {
      highestEducation:
        api.highestEducation ?? "",

      educationField:
        api.educationField ?? "",

      profession:
        api.profession ?? "",

      company:
        api.company ?? "",

      annualIncome:
        api.annualIncome ?? "",
    },

    familyInfo: {
      fatherName:
        api.fatherName ?? "",

      motherName:
        api.motherName ?? "",

      siblings:
        api.siblings ?? "",

      familyLocation:
        api.familyLocation ?? "",

      familyType:
        api.familyType ?? "",

      familyValues:
        api.familyValues ?? "",
    },

    preferenceInfo: {
      preferredAgeFrom:
        api.preferredAgeFrom?.toString() ?? "",

      preferredAgeTo:
        api.preferredAgeTo?.toString() ?? "",

      preferredHeightFromCm:
        api.preferredHeightFromCm?.toString() ?? "",

      preferredHeightToCm:
        api.preferredHeightToCm?.toString() ?? "",

      preferredReligion:
        api.preferredReligion ?? "",

      preferredDenomination:
        api.preferredDenomination ?? "",

      preferredMaritalStatus:
        api.preferredMaritalStatus ?? "",

      preferredCommunity:
        api.preferredCommunity ?? "",

      communityNoBar:
        api.communityNoBar ?? true,

      preferredMotherTongue:
        api.preferredMotherTongue ?? "",

      preferredEducation:
        api.preferredEducation ?? "",

      preferredProfession:
        api.preferredProfession ?? "",

      preferredCountry:
        api.preferredCountry ?? "",

      preferredState:
        api.preferredState ?? "",

      preferredCity:
        api.preferredCity ?? "",

      preferredDiet:
        api.preferredDiet ?? "",

      preferredSmoking:
        api.preferredSmoking ?? "",

      preferredDrinking:
        api.preferredDrinking ?? "",

      preferredFaithCommitment:
        api.preferredFaithCommitment ?? "",
    },

    locationInfo: {
      city:
        api.city ?? "",

      state:
        api.state ?? "",

      country:
        api.country ?? "",
    },

    aboutInfo: {
      aboutMe:
        api.aboutMe ?? "",
    },

    photoInfo: {
      photos,

      primaryPhoto:
        photos.find(
          (photo) =>
            photo.isPrimary
        )?.preview ?? "",
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

    age:
      profile.basicInfo.age
        ? Number(
            profile.basicInfo.age
          )
        : undefined,

    heightCm:
      profile.basicInfo.heightCm
        ? Number(
            profile.basicInfo.heightCm
          )
        : undefined,

    weightKg:
      profile.basicInfo.weightKg
        ? Number(
            profile.basicInfo.weightKg
          )
        : undefined,

    preferredAgeFrom:
      profile.preferenceInfo
        .preferredAgeFrom
        ? Number(
            profile.preferenceInfo
              .preferredAgeFrom
          )
        : undefined,

    preferredAgeTo:
      profile.preferenceInfo
        .preferredAgeTo
        ? Number(
            profile.preferenceInfo
              .preferredAgeTo
          )
        : undefined,

    preferredHeightFromCm:
      profile.preferenceInfo
        .preferredHeightFromCm
        ? Number(
            profile.preferenceInfo
              .preferredHeightFromCm
          )
        : undefined,

    preferredHeightToCm:
      profile.preferenceInfo
        .preferredHeightToCm
        ? Number(
            profile.preferenceInfo
              .preferredHeightToCm
          )
        : undefined,

    communityNoBar:
      profile.preferenceInfo
        .communityNoBar,

    baptized:
      profile.churchInfo.baptized === ""
        ? undefined
        : profile.churchInfo.baptized ===
          "true",
  };
}

export default function ProfileProvider({
  children,
}: Props) {
  const [
    profile,
    setProfile,
  ] =
    useState<ProfileState>(
      initialProfile
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const {
    restoreDraft,
    removeDraft,
    saveStatus,
  } =
    useProfileRecovery(profile);

  const refreshProfile =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const data =
          await profileService.getProfile();

        if (data) {
          setProfile(
            mapApiToState(data)
          );

          return;
        }

        /*
         * A missing backend profile is valid for
         * a newly registered user.
         */
        const draft =
          restoreDraft();

        if (draft) {
          setProfile(draft);
        }
      } catch (err) {
        console.error(
          "Unable to load profile:",
          err
        );

        const draft =
          restoreDraft();

        if (draft) {
          setProfile(draft);
        } else {
          setError(
            "Unable to load your profile. Please refresh and try again."
          );
        }
      } finally {
        setLoading(false);
      }
    }, [restoreDraft]);

  const saveProfile =
    useCallback(
      async (): Promise<boolean> => {
        if (saving) {
          return false;
        }

        setSaving(true);
        setError(null);

        try {
          const savedProfile =
            await profileService.updateProfile(
              mapStateToApi(
                profile
              )
            );

          /*
           * Keep the backend as the source of truth,
           * but preserve current photo state when the
           * profile response does not include photos.
           */
          const mappedProfile =
            mapApiToState(
              savedProfile
            );

          setProfile(
            (
              currentProfile
            ) => ({
              ...mappedProfile,

              photoInfo:
                currentProfile.photoInfo,
            })
          );

          removeDraft();

          return true;
        } catch (err) {
          console.error(
            "Unable to save profile:",
            err
          );

          setError(
            "Unable to save your profile. Please check your connection and try again."
          );

          return false;
        } finally {
          setSaving(false);
        }
      },
      [
        profile,
        removeDraft,
        saving,
      ]
    );

  useEffect(() => {
    void refreshProfile();
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

        clearSavedDraft:
          removeDraft,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}