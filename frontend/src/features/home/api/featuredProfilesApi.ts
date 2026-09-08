import publicApi from "@/lib/publicApi";

export interface PublicFeaturedProfile {
  id: string;
  firstName: string;
  age: number | null;
  denomination: string | null;
  profession: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  completionPercentage: number | null;
  mobileVerified: boolean;
  churchVerified: boolean;
  identityVerified: boolean;
  verifiedProfile: boolean;
  primaryPhotoUrl: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export async function getPublicFeaturedProfiles():
  Promise<PublicFeaturedProfile[]> {

  const response =
    await publicApi.get<
      ApiResponse<PublicFeaturedProfile[]>
    >(
      "/public/featured-profiles"
    );

  return Array.isArray(response.data.data)
    ? response.data.data
    : [];
}
