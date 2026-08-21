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

  heightCm: string;
  weightKg: string;
  complexion: string;
  bodyType: string;
  motherTongue: string;
  religion: string;
  community: string;
  subCommunity: string;
  faithBackground: string;
  physicalStatus: string;

  diet: string;
  smoking: string;
  drinking: string;
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
  educationField: string;
  profession: string;
  company: string;
  annualIncome: string;
}

export interface FamilyInfo {
  fatherName: string;
  motherName: string;
  siblings: string;
  familyLocation: string;
  familyType: string;
  familyValues: string;
}

export interface PreferenceInfo {
  preferredAgeFrom: string;
  preferredAgeTo: string;

  preferredHeightFromCm: string;
  preferredHeightToCm: string;

  preferredReligion: string;
  preferredDenomination: string;
  preferredMaritalStatus: string;

  preferredCommunity: string;
  communityNoBar: boolean;

  preferredMotherTongue: string;

  preferredEducation: string;
  preferredProfession: string;

  preferredCountry: string;
  preferredState: string;
  preferredCity: string;

  preferredDiet: string;
  preferredSmoking: string;
  preferredDrinking: string;

  preferredFaithCommitment: string;
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