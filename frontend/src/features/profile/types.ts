export interface PhotoItem {
  id: string;
  preview: string;
  file?: File;
  isPrimary: boolean;
  displayOrder?: number;
}

export type ProfilePhoto = PhotoItem;


export interface BasicInfo {
  fullName: string;
  mobile: string;
  dateOfBirth: string;
  gender: string;
  age: string;
  maritalStatus: string;
  email: string;
}


export interface ChurchInfo {
  denomination: string;
  churchName: string;
  pastorName: string;
  baptized: string;
  membershipId: string;
  churchAddress: string;
}


export interface EducationInfo {
  highestEducation: string;
  profession: string;
  company: string;
  annualIncome: string;
}


export interface FamilyInfo {
  fatherName: string;
  motherName: string;
  siblings: string;
  familyLocation: string;
}


export interface PreferenceInfo {
  preferredAgeFrom: string;
  preferredAgeTo: string;
  preferredDenomination: string;
  preferredEducation: string;
}


export interface LocationInfo {
  city: string;
  state: string;
  country: string;
}


export interface AboutInfo {
  aboutMe: string;
}


export interface ProfileState {
  basicInfo: BasicInfo;

  churchInfo: ChurchInfo;

  educationInfo: EducationInfo;

  familyInfo: FamilyInfo;

  preferenceInfo: PreferenceInfo;

  locationInfo: LocationInfo;

  aboutInfo: AboutInfo;

  photoInfo: {
    photos: PhotoItem[];
    primaryPhoto: string;
  };
}