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

      preferredCity:
        data.preferredCity ?? "",

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
      city:
        data.city ?? "",

      state:
        data.state ?? "",

      country:
        data.country ?? "",
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