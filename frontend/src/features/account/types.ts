export interface Account {
  id: string;
  fullName: string;
  email: string;
  mobile: string | null;
  emailVerified: boolean;
  status: string;
  membershipType: string | null;
  profileCompletion: number | null;
  lastLoginAt: string | null;
  createdAt: string | null;
}

export interface UpdateAccountRequest {
  fullName: string;
  mobile: string;
}

export interface ReactivateAccountRequest {
  email: string;
  password: string;
}

export interface DeactivateAccountRequest {
  password: string;
  reason: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AccountActionResponse {
  message: string;
}
