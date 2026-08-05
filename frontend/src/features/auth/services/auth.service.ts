import api from "@/lib/api";

import {
  clearAuthStorage,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
  type StoredAuthUser,
} from "@/lib/auth";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
}

export interface RegisterResponse {
  userId?: string;
  fullName?: string;
  email?: string;
  mobile?: string;
  message?: string;
}

export interface VerifyEmailOtpRequest {
  email: string;
  otp: string;
}

export interface ResendEmailOtpRequest {
  email: string;
}

export interface EmailVerificationResponse {
  userId?: string;
  email: string;
  emailVerified: boolean;
  message?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface PasswordResetResponse {
  success?: boolean;
  message: string;
}

export interface VerifyPasswordResetOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyPasswordResetOtpResponse {
  success?: boolean;
  message: string;
  resetToken: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthUser
  extends StoredAuthUser {
  id?: string;
  fullName?: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;

  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;

  user?: AuthUser;

  id?: string;
  fullName?: string;
  email?: string;
  role?: string;

  data?: {
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    expiresIn?: number;

    user?: AuthUser;

    id?: string;
    fullName?: string;
    email?: string;
    role?: string;
  };
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser | null;
  message?: string;
}

function extractAccessToken(
  response: AuthResponse
): string | null {
  return (
    response.accessToken ??
    response.data?.accessToken ??
    null
  );
}

function extractUser(
  response: AuthResponse
): AuthUser | null {
  if (response.user) {
    return response.user;
  }

  if (response.data?.user) {
    return response.data.user;
  }

  const email =
    response.email ??
    response.data?.email;

  if (!email) {
    return null;
  }

  return {
    id:
      response.id ??
      response.data?.id,

    fullName:
      response.fullName ??
      response.data?.fullName,

    email,

    role:
      response.role ??
      response.data?.role,
  };
}

function saveSession(
  response: AuthResponse
): AuthSession {
  const accessToken =
    extractAccessToken(response);

  if (!accessToken) {
    throw new Error(
      response.message ??
        "Access token was not returned."
    );
  }

  const user =
    extractUser(response);

  setToken(accessToken);

  if (user) {
    setStoredUser(user);
  }

  return {
    accessToken,
    user,
    message: response.message,
  };
}

export const authService = {
  async register(
    data: RegisterRequest
  ): Promise<RegisterResponse> {
    const response =
      await api.post<RegisterResponse>(
        "/auth/register",
        data
      );

    return response.data;
  },

  async verifyEmailOtp(
    data: VerifyEmailOtpRequest
  ): Promise<EmailVerificationResponse> {
    const response =
      await api.post<EmailVerificationResponse>(
        "/auth/verify-email-otp",
        data
      );

    return response.data;
  },

  async resendEmailOtp(
    data: ResendEmailOtpRequest
  ): Promise<EmailVerificationResponse> {
    const response =
      await api.post<EmailVerificationResponse>(
        "/auth/resend-email-otp",
        data
      );

    return response.data;
  },

  async getEmailVerificationStatus(
    email: string
  ): Promise<EmailVerificationResponse> {
    const response =
      await api.get<EmailVerificationResponse>(
        "/auth/email-verification-status",
        {
          params: {
            email,
          },
        }
      );

    return response.data;
  },

  async requestPasswordResetOtp(
    data: ForgotPasswordRequest
  ): Promise<PasswordResetResponse> {
    const response =
      await api.post<PasswordResetResponse>(
        "/auth/forgot-password/request-otp",
        data
      );

    return response.data;
  },

  async verifyPasswordResetOtp(
    data: VerifyPasswordResetOtpRequest
  ): Promise<VerifyPasswordResetOtpResponse> {
    const response =
      await api.post<VerifyPasswordResetOtpResponse>(
        "/auth/forgot-password/verify-otp",
        data
      );

    return response.data;
  },

  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<PasswordResetResponse> {
    const response =
      await api.post<PasswordResetResponse>(
        "/auth/forgot-password/reset",
        data
      );

    return response.data;
  },

  async login(
    data: LoginRequest
  ): Promise<AuthSession> {
    const response =
      await api.post<AuthResponse>(
        "/auth/login",
        data
      );

    return saveSession(
      response.data
    );
  },

  async refresh(): Promise<AuthSession> {
    const response =
      await api.post<AuthResponse>(
        "/auth/refresh",
        {}
      );

    return saveSession(
      response.data
    );
  },

  async logout(): Promise<void> {
    try {
      await api.post(
        "/auth/logout",
        {}
      );
    } catch {
      // Clear local authentication even
      // if the backend logout request fails.
    } finally {
      clearAuthStorage();
    }
  },

  getToken(): string | null {
    return getToken();
  },

  getUser(): AuthUser | null {
    return getStoredUser();
  },

  isLoggedIn(): boolean {
    return Boolean(getToken());
  },
};

export default authService;