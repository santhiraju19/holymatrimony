import axios from "axios";

import api from "@/lib/api";

export interface PhotoPayload {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProfilePayload {
  fullName?: string;
  email?: string;

  mobile?: string;
  dateOfBirth?: string;
  gender?: string;
  age?: number;
  maritalStatus?: string;

  denomination?: string;
  churchName?: string;
  pastorName?: string;
  baptized?: boolean;
  membershipId?: string;
  churchAddress?: string;

  highestEducation?: string;
  profession?: string;
  company?: string;
  annualIncome?: string;

  fatherName?: string;
  motherName?: string;
  siblings?: string;
  familyLocation?: string;

  preferredAgeFrom?: number;
  preferredAgeTo?: number;
  preferredDenomination?: string;
  preferredEducation?: string;

  city?: string;
  state?: string;
  country?: string;

  aboutMe?: string;

  completionPercentage?: number;

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

  async deletePhoto(id: number): Promise<void> {
    await api.delete(`/profile/photos/${id}`);
  },

  async setPrimaryPhoto(id: number): Promise<void> {
    await api.put(
      `/profile/photos/${id}/primary`
    );
  },

  async reorderPhotos(
    photoIds: number[]
  ): Promise<void> {
    await api.put("/profile/photos/order", {
      photoIds,
    });
  },
};

export default profileService;