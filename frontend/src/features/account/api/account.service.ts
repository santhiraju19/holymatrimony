import api from "@/lib/api";

import {
  Account,
  AccountActionResponse,
  ChangePasswordRequest,
  UpdateAccountRequest,
} from "@/features/account/types";

export const accountService = {
  async getAccount(): Promise<Account> {
    const response =
      await api.get<Account>("/account");

    return response.data;
  },

  async updateAccount(
    request: UpdateAccountRequest
  ): Promise<Account> {
    const response =
      await api.put<Account>(
        "/account",
        request
      );

    return response.data;
  },

  async changePassword(
    request: ChangePasswordRequest
  ): Promise<AccountActionResponse> {
    const response =
      await api.post<AccountActionResponse>(
        "/account/change-password",
        request
      );

    return response.data;
  },

  async logoutAll(): Promise<AccountActionResponse> {
    const response =
      await api.post<AccountActionResponse>(
        "/account/logout-all"
      );

    return response.data;
  },
};

export default accountService;
