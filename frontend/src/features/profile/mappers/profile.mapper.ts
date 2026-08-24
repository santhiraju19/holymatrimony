import {
  ProfileState,
} from "../types";

import {
  ProfilePayload,
} from "../services/profile.service";

export function toProfileState(
  data: ProfilePayload
): ProfileState {
  return {
    basicInfo: {
      fullName:
        data.fullName ?? "",

      email:
        data.email ?? "",

      mobile:
        data.mobile ?? "",

      dateOfBirth:
        data.dateOfBirth ?? "",

      gender:
        data.gender ?? "",

      age:
        data.age?.toString() ?? "",

      maritalStatus:
        data.maritalStatus ?? "",

      heightCm:
        data.heightCm?.toString() ?? "",

      weightKg:
        data.weightKg?.toString() ?? "",

      complexion:
        data.complexion ?? "",

      bodyType:
        data.bodyType ?? "",

      motherTongue:
        data.motherTongue ?? "",

      religion:
        data.religion ?? "",

      community:
        data.community ?? "",

      subCommunity:
        data.subCommunity ?? "",

      faithBackground:
        data.faithBackground ?? "",

      physicalStatus:
        data.physicalStatus ?? "",

      diet:
        data.diet ?? "",

      smoking:
        data.smoking ?? "",

      drinking:
        data.drinking ?? "",
    },

    churchInfo: {
      churchName:
        data.churchName ?? "",

      denomination:
        data.denomination ?? "",

      pastorName:
        data.pastorName ?? "",

      baptized:
        data.baptized === undefined ||
        data.baptized === null
          ? ""
          : String(data.baptized),

      membershipId:
        data.membershipId ?? "",

      churchAddress:
        data.churchAddress ?? "",

      churchCountry:
        data.churchCountry ?? "",

      churchState:
        data.churchState ?? "",

      churchDistrict:
        data.churchDistrict ?? "",

      churchCity:
        data.churchCity ?? "",
    },

    educationInfo: {
      highestEducation:
        data.highestEducation ?? "",

      educationField:
        data.educationField ?? "",

      profession:
        data.profession ?? "",

      company:
        data.company ?? "",

      annualIncome:
        data.annualIncome ?? "",
    },

    familyInfo: {
      fatherName:
        data.fatherName ?? "",

      motherName:
        data.motherName ?? "",

      siblings:
        data.siblings ?? "",

      familyLocation:
        data.familyLocation ?? "",

      familyCountry:
        data.familyCountry ?? "",

      familyState:
        data.familyState ?? "",

      familyDistrict:
        data.familyDistrict ?? "",

      familyCity:
        data.familyCity ?? "",

      familyType:
        data.familyType ?? "",

      familyValues:
        data.familyValues ?? "",
    },

    preferenceInfo: {
      preferredAgeFrom:
        data.preferredAgeFrom?.toString() ?? "",

      preferredAgeTo:
        data.preferredAgeTo?.toString() ?? "",

      preferredHeightFromCm:
        data.preferredHeightFromCm?.toString() ?? "",

      preferredHeightToCm:
        data.preferredHeightToCm?.toString() ?? "",

      preferredReligion:
        data.preferredReligion ?? "",

      preferredDenomination:
        data.preferredDenomination ?? "",

      preferredMaritalStatus:
        data.preferredMaritalStatus ?? "",

      preferredCommunity:
        data.preferredCommunity ?? "",

      communityNoBar:
        data.communityNoBar ?? true,

      preferredMotherTongue:
        data.preferredMotherTongue ?? "",

      preferredEducation:
        data.preferredEducation ?? "",

      preferredProfession:
        data.preferredProfession ?? "",

      preferredCountry:
        data.preferredCountry ?? "",

      preferredState:
        data.preferredState ?? "",

      preferredDistrict:
        data.preferredDistrict ?? "",

      preferredCity:
        data.preferredCity ?? "",

      preferredLocations:
        data.preferredLocations?.length
          ? data.preferredLocations.map(
              (location) => ({
                country:
                  location.country ?? "",
                state:
                  location.state ?? "",
                district:
                  location.district ?? "",
                city:
                  location.city ?? "",
              })
            )
          : (
              data.preferredCountry ||
              data.preferredState ||
              data.preferredDistrict ||
              data.preferredCity
            )
            ? [
                {
                  country:
                    data.preferredCountry ?? "",
                  state:
                    data.preferredState ?? "",
                  district:
                    data.preferredDistrict ?? "",
                  city:
                    data.preferredCity ?? "",
                },
              ]
            : [],

      preferredDiet:
        data.preferredDiet ?? "",

      preferredSmoking:
        data.preferredSmoking ?? "",

      preferredDrinking:
        data.preferredDrinking ?? "",

      preferredFaithCommitment:
        data.preferredFaithCommitment ?? "",
    },

    locationInfo: {
      country:
        data.country ?? "",

      state:
        data.state ?? "",

      district:
        data.district ?? "",

      city:
        data.city ?? "",
    },

    aboutInfo: {
      aboutMe:
        data.aboutMe ?? "",
    },

    photoInfo: {
      photos: [],
      primaryPhoto: "",
    },
  };
}
