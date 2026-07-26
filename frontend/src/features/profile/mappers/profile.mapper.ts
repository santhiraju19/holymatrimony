import { ProfileState } from "../types";
import { ProfilePayload } from "../services/profile.service";


export function toProfileState(
  data: ProfilePayload
): ProfileState {

  return {

    basicInfo: {
      fullName: data.fullName ?? "",
      email: data.email ?? "",
      mobile: data.mobile ?? "",
      dateOfBirth: data.dateOfBirth ?? "",
      gender: data.gender ?? "",
      age: data.age?.toString() ?? "",
      maritalStatus: data.maritalStatus ?? "",
    },


    churchInfo: {
      churchName: data.churchName ?? "",
      denomination: data.denomination ?? "",
      pastorName: data.pastorName ?? "",

      baptized:
        data.baptized === undefined
          ? ""
          : String(data.baptized),

      membershipId: data.membershipId ?? "",
      churchAddress: data.churchAddress ?? "",
    },


    educationInfo: {
      highestEducation:
        data.highestEducation ?? "",

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
    },


    preferenceInfo: {
      preferredAgeFrom:
        data.preferredAgeFrom?.toString() ?? "",

      preferredAgeTo:
        data.preferredAgeTo?.toString() ?? "",

      preferredDenomination:
        data.preferredDenomination ?? "",

      preferredEducation:
        data.preferredEducation ?? "",
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