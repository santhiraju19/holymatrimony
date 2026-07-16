export interface ProfilePhoto {
  id: string;
  file: File;
  preview: string;
  isPrimary: boolean;
}

export interface BasicDetails {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  mobile: string;
  email: string;
  maritalStatus: string;
}

export interface ChurchDetails {
  denomination: string;
  churchName: string;
  pastorName: string;
  baptismStatus: string;
  churchCity: string;
}

export interface EducationDetails {
  highestQualification: string;
  college: string;
  occupation: string;
  company: string;
  annualIncome: string;
}

export interface FamilyDetails {
  fatherName: string;
  motherName: string;
  fatherOccupation: string;
  motherOccupation: string;
  siblings: string;
  familyStatus: string;
}

export interface PreferenceDetails {
  ageFrom: string;
  ageTo: string;
  heightFrom: string;
  heightTo: string;
  education: string;
  denomination: string;
  location: string;
}

export interface ProfileData {
  basic: BasicDetails;
  church: ChurchDetails;
  education: EducationDetails;
  family: FamilyDetails;
  preferences: PreferenceDetails;
  photos: ProfilePhoto[];
}