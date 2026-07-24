import api from "@/lib/api";

export interface ProfileData {
  id?: string;

  // Basic Information
  fullName: string;
  email: string;
  mobile: string;
  dateOfBirth: string;
  gender: string;
  age: number;
  maritalStatus: string;

  // Church Information
  churchName: string;
  denomination: string;
  pastorName: string;
  baptized: string;
  membershipId: string;
  churchAddress: string;

  // Education
  highestEducation: string;
  profession: string;
  company: string;
  annualIncome: string;

  // Family
  fatherName: string;
  motherName: string;
  siblings: string;
  familyLocation: string;

  // Partner Preferences
  preferredAgeFrom: string;
  preferredAgeTo: string;
  preferredDenomination: string;
  preferredEducation: string;

  // Location
  city: string;
  state: string;
  country: string;

  // About
  aboutMe: string;

  // Optional
  completionPercentage?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const profileService = {
  async getProfile(): Promise<ProfileData> {
    const response =
      await api.get<ApiResponse<ProfileData>>("/profile");

    return response.data.data;
  },

  async updateProfile(
    data: ProfileData
  ): Promise<ProfileData> {
    const response =
      await api.put<ApiResponse<ProfileData>>(
        "/profile",
        data
      );

    return response.data.data;
  },
};

export default profileService;