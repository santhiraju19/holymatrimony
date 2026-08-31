import axios from "axios";

import api from "@/lib/api";

export type ProfileVerificationStatus =
  | "NOT_SUBMITTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface PhotoPayload {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface PreferredLocationPayload {
  country?: string;
  state?: string;
  district?: string;
  city?: string;
}

export interface ProfilePayload {
  id?: string;
  userId?: string;

  fullName?: string;
  email?: string;

  mobile?: string;
  dateOfBirth?: string;
  gender?: string;
  age?: number;
  maritalStatus?: string;

  heightCm?: number;
  weightKg?: number;
  complexion?: string;
  bodyType?: string;
  motherTongue?: string;
  religion?: string;
  community?: string;
  subCommunity?: string;
  faithBackground?: string;
  physicalStatus?: string;

  diet?: string;
  smoking?: string;
  drinking?: string;

  // Church

  denomination?: string;
  churchName?: string;
  pastorName?: string;
  baptized?: boolean;
  membershipId?: string;

  /*
   * Legacy formatted church address.
   */
  churchAddress?: string;

  churchCountry?: string;
  churchState?: string;
  churchDistrict?: string;
  churchCity?: string;

  // Education

  highestEducation?: string;
  educationField?: string;
  profession?: string;
  company?: string;
  annualIncome?: string;

  // Family

  fatherName?: string;
  motherName?: string;
  siblings?: string;

  /*
   * Legacy formatted family location.
   */
  familyLocation?: string;

  familyCountry?: string;
  familyState?: string;
  familyDistrict?: string;
  familyCity?: string;

  familyType?: string;
  familyValues?: string;

  // Preferences

  preferredAgeFrom?: number;
  preferredAgeTo?: number;

  preferredHeightFromCm?: number;
  preferredHeightToCm?: number;

  preferredReligion?: string;
  preferredDenomination?: string;
  preferredMaritalStatus?: string;

  preferredCommunity?: string;
  communityNoBar?: boolean;

  preferredMotherTongue?: string;

  preferredEducation?: string;
  preferredProfession?: string;

  preferredCountry?: string;
  preferredState?: string;
  preferredDistrict?: string;
  preferredCity?: string;

  preferredLocations?: PreferredLocationPayload[];

  preferredDiet?: string;
  preferredSmoking?: string;
  preferredDrinking?: string;

  preferredFaithCommitment?: string;

  // Current location

  country?: string;
  state?: string;
  district?: string;
  city?: string;

  // About

  aboutMe?: string;

  // Completion

  completionPercentage?: number;
  profileCompleted?: boolean;

  // Verification

  verificationStatus?: ProfileVerificationStatus;
  verificationSubmittedAt?: string | null;
  verificationReviewedAt?: string | null;
  verificationReason?: string | null;

  photos?: PhotoPayload[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const profileService = {
  async getProfile(): Promise<ProfilePayload | null> {
    try {
      const response =
        await api.get<ApiResponse<ProfilePayload>>(
          "/profile"
        );

      return response.data.data ?? null;
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 404
      ) {
        return null;
      }

      throw error;
    }
  },

  async updateProfile(
    data: ProfilePayload
  ): Promise<ProfilePayload> {
    const response =
      await api.put<ApiResponse<ProfilePayload>>(
        "/profile",
        data
      );

    return response.data.data;
  },

  async patchProfile(
    data: Partial<ProfilePayload>
  ): Promise<ProfilePayload> {
    const response =
      await api.patch<ApiResponse<ProfilePayload>>(
        "/profile",
        data
      );

    return response.data.data;
  },

  async uploadPhoto(
    file: File
  ): Promise<PhotoPayload> {
    const formData = new FormData();

    formData.append("file", file);

    const response =
      await api.post<ApiResponse<PhotoPayload>>(
        "/profile/photos",
        formData
      );

    return response.data.data;
  },

  async deletePhoto(
    id: number
  ): Promise<void> {
    await api.delete(
      `/profile/photos/${id}`
    );
  },

  async setPrimaryPhoto(
    id: number
  ): Promise<void> {
    await api.put(
      `/profile/photos/${id}/primary`
    );
  },

  async reorderPhotos(
    photoIds: number[]
  ): Promise<void> {
    await api.put(
      "/profile/photos/order",
      {
        photoIds,
      }
    );
  },
};

export default profileService;
