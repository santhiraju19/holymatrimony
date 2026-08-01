
export type VisibilityScope =
  | "EVERYONE"
  | "REGISTERED_MEMBERS"
  | "VERIFIED_MEMBERS"
  | "INTEREST_ACCEPTED"
  | "MUTUAL_APPROVAL"
  | "NOBODY";

export type CallPermission =
  | "DISABLED"
  | "INTEREST_ACCEPTED"
  | "MUTUAL_APPROVAL";

export interface PrivacySettings {
  id: string;
  userId: string;

  profileVisibility: VisibilityScope;
  photoVisibility: VisibilityScope;
  phoneVisibility: VisibilityScope;
  emailVisibility: VisibilityScope;
  addressVisibility: VisibilityScope;
  churchVisibility: VisibilityScope;
  familyVisibility: VisibilityScope;
  onlineVisibility: VisibilityScope;
  lastSeenVisibility: VisibilityScope;

  audioCallPermission: CallPermission;
  videoCallPermission: CallPermission;

  allowPhotoRequests: boolean;
  allowContactRequests: boolean;

  createdAt: string;
  updatedAt?: string | null;
}

export interface UpdatePrivacySettingsRequest {
  profileVisibility?: VisibilityScope;
  photoVisibility?: VisibilityScope;
  phoneVisibility?: VisibilityScope;
  emailVisibility?: VisibilityScope;
  addressVisibility?: VisibilityScope;
  churchVisibility?: VisibilityScope;
  familyVisibility?: VisibilityScope;
  onlineVisibility?: VisibilityScope;
  lastSeenVisibility?: VisibilityScope;

  audioCallPermission?: CallPermission;
  videoCallPermission?: CallPermission;

  allowPhotoRequests?: boolean;
  allowContactRequests?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}