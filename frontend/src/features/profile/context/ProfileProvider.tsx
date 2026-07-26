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
      baptized:
        api.baptized === undefined
          ? ""
          : String(api.baptized),
      membershipId: api.membershipId ?? "",
      churchAddress: api.churchAddress ?? "",
    },


    educationInfo: {
      highestEducation:
        api.highestEducation ?? "",

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
  photos: (api.photos ?? [])
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((photo) => ({
      id: String(photo.id),
      preview: photo.imageUrl,
      isPrimary: photo.isPrimary,
      displayOrder: photo.displayOrder,
    })),

  primaryPhoto:
    api.photos?.find((photo) => photo.isPrimary)?.imageUrl ?? "",
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
        ? Number(profile.basicInfo.age)
        : undefined,


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


    baptized:
      profile.churchInfo.baptized === ""
        ? undefined
        : profile.churchInfo.baptized === "true",

  };
}



export default function ProfileProvider({
  children,
}: Props) {


  const [profile, setProfile] =
    useState<ProfileState>(
      initialProfile
    );


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

        const data = await profileService.getProfile();

if (!data) {
  return;
}

setProfile(
  mapApiToState(data)
);


      } catch (err) {

        console.error(err);


        const draft =
          restoreDraft();


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


    }, [
      profile,
      removeDraft,
    ]);




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


        clearSavedDraft:
          removeDraft,

      }}

    >

      {children}

    </ProfileContext.Provider>

  );

}