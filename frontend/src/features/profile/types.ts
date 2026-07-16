export interface BasicInfo {
  fullName: string;
  mobile: string;
  dateOfBirth: string;
  gender: string;
}

export interface ChurchInfo {
  churchName: string;
  denomination: string;
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
  denomination: string;
  education: string;
}

export interface PhotoItem {
  id: string;
  file: File;
  preview: string;
  isPrimary: boolean;
}

export interface PhotoInfo {
  photos: PhotoItem[];
  primaryPhoto: string;
}

export interface ProfileState {
  basicInfo: BasicInfo;
  churchInfo: ChurchInfo;
  educationInfo: EducationInfo;
  familyInfo: FamilyInfo;
  preferenceInfo: PreferenceInfo;
  photoInfo: PhotoInfo;
}