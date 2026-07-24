import { ProfileState } from "../types";
import { ProfileData } from "../services/profile.service";

export function toProfileState(data: ProfileData): ProfileState {
  return {
    basicInfo: {
      fullName: data.fullName ?? "",
      email: data.email ?? "",
      mobile: data.mobile ?? "",
      dateOfBirth: data.dateOfBirth ?? "",
      gender: data.gender ?? "",
      age: data.age ? String(data.age) : "",
      maritalStatus: data.maritalStatus ?? "",
    },

    churchInfo: {
      churchName: data.churchName ?? "",
      denomination: data.denomination ?? "",
      pastorName: data.pastorName ?? "",
      baptized: data.baptized ?? "",
      membershipId: data.membershipId ?? "",
      churchAddress: data.churchAddress ?? "",
    },

    educationInfo: {
      highestEducation: data.highestEducation ?? "",
      profession: data.profession ?? "",
      company: data.company ?? "",
      annualIncome: data.annualIncome ?? "",
    },

    familyInfo: {
      fatherName: data.fatherName ?? "",
      motherName: data.motherName ?? "",
      siblings: data.siblings ?? "",
      familyLocation: data.familyLocation ?? "",
    },

    preferenceInfo: {
      preferredAgeFrom: data.preferredAgeFrom ?? "",
      preferredAgeTo: data.preferredAgeTo ?? "",
      preferredDenomination: data.preferredDenomination ?? "",
      preferredEducation: data.preferredEducation ?? "",
    },

    locationInfo: {
      city: data.city ?? "",
      state: data.state ?? "",
      country: data.country ?? "",
    },

    aboutInfo: {
      aboutMe: data.aboutMe ?? "",
    },

    photoInfo: {
      photos: [],
      primaryPhoto: "",
    },
  };
}

export function toProfileRequest(
  profile: ProfileState
): ProfileData {
  return {
    fullName: profile.basicInfo.fullName,
    email: profile.basicInfo.email,
    mobile: profile.basicInfo.mobile,
    dateOfBirth: profile.basicInfo.dateOfBirth,
    gender: profile.basicInfo.gender,
    age: Number(profile.basicInfo.age || 0),
    maritalStatus: profile.basicInfo.maritalStatus,

    churchName: profile.churchInfo.churchName,
    denomination: profile.churchInfo.denomination,
    pastorName: profile.churchInfo.pastorName,
    baptized: profile.churchInfo.baptized,
    membershipId: profile.churchInfo.membershipId,
    churchAddress: profile.churchInfo.churchAddress,

    highestEducation: profile.educationInfo.highestEducation,
    profession: profile.educationInfo.profession,
    company: profile.educationInfo.company,
    annualIncome: profile.educationInfo.annualIncome,

    fatherName: profile.familyInfo.fatherName,
    motherName: profile.familyInfo.motherName,
    siblings: profile.familyInfo.siblings,
    familyLocation: profile.familyInfo.familyLocation,

    preferredAgeFrom: profile.preferenceInfo.preferredAgeFrom,
    preferredAgeTo: profile.preferenceInfo.preferredAgeTo,
    preferredDenomination:
      profile.preferenceInfo.preferredDenomination,
    preferredEducation:
      profile.preferenceInfo.preferredEducation,

    city: profile.locationInfo.city,
    state: profile.locationInfo.state,
    country: profile.locationInfo.country,

    aboutMe: profile.aboutInfo.aboutMe,
  };
}