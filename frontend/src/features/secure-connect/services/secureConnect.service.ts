import api from "@/lib/api";

import {
  CallMediaType,
  InitiateSecureConnectCallRequest,
  CreateSecureConnectTopUpResponse,
  SecureConnectBalance,
  SecureConnectCall,
  SecureConnectMediaCredentials,
  SecureConnectTopUpPackage,
  SecureConnectTopUpStatus,
  VerifySecureConnectTopUpRequest,
} from "../types";

const CALLS_PATH =
  "/calls";

function callActionPath(
  callId: string,
  action:
    | "accept"
    | "connected"
    | "decline"
    | "cancel"
    | "end"
): string {
  return `${CALLS_PATH}/${encodeURIComponent(
    callId
  )}/${action}`;
}

export const secureConnectService = {
  async getBalance(): Promise<SecureConnectBalance> {
    const response =
      await api.get<SecureConnectBalance>(
        "/secure-connect/balance"
      );

    return response.data;
  },

  async getTopUpPackages():
    Promise<SecureConnectTopUpPackage[]> {
    const response =
      await api.get<SecureConnectTopUpPackage[]>(
        "/secure-connect/topups/packages"
      );

    return response.data;
  },

  async createTopUpOrder(
    packageCode: string
  ): Promise<CreateSecureConnectTopUpResponse> {
    const response =
      await api.post<CreateSecureConnectTopUpResponse>(
        "/secure-connect/topups/create-order",
        {
          packageCode,
        }
      );

    return response.data;
  },

  async verifyTopUpPayment(
    request: VerifySecureConnectTopUpRequest
  ): Promise<void> {
    await api.post(
      "/secure-connect/topups/verify",
      request
    );
  },

  async getTopUpStatus(
    topUpPaymentId: string
  ): Promise<SecureConnectTopUpStatus> {
    const response =
      await api.get<SecureConnectTopUpStatus>(
        `/secure-connect/topups/${encodeURIComponent(
          topUpPaymentId
        )}`
      );

    return response.data;
  },

  async initiateCall(
    calleeUserId: string,
    mediaType: CallMediaType
  ): Promise<SecureConnectCall> {
    const request: InitiateSecureConnectCallRequest = {
      calleeUserId,
      mediaType,
    };

    const response =
      await api.post<SecureConnectCall>(
        CALLS_PATH,
        request
      );

    return response.data;
  },

  async acceptCall(
    callId: string
  ): Promise<SecureConnectCall> {
    const response =
      await api.post<SecureConnectCall>(
        callActionPath(
          callId,
          "accept"
        )
      );

    return response.data;
  },

  async markConnected(
    callId: string
  ): Promise<SecureConnectCall> {
    const response =
      await api.post<SecureConnectCall>(
        callActionPath(
          callId,
          "connected"
        )
      );

    return response.data;
  },

  async declineCall(
    callId: string
  ): Promise<SecureConnectCall> {
    const response =
      await api.post<SecureConnectCall>(
        callActionPath(
          callId,
          "decline"
        )
      );

    return response.data;
  },

  async cancelCall(
    callId: string
  ): Promise<SecureConnectCall> {
    const response =
      await api.post<SecureConnectCall>(
        callActionPath(
          callId,
          "cancel"
        )
      );

    return response.data;
  },

  async endCall(
    callId: string
  ): Promise<SecureConnectCall> {
    const response =
      await api.post<SecureConnectCall>(
        callActionPath(
          callId,
          "end"
        )
      );

    return response.data;
  },

  async getMediaCredentials(
    callId: string
  ): Promise<SecureConnectMediaCredentials> {
    const response =
      await api.post<SecureConnectMediaCredentials>(
        `${CALLS_PATH}/${encodeURIComponent(
          callId
        )}/media-token`
      );

    return response.data;
  },

  async getHistory():
    Promise<SecureConnectCall[]> {
    const response =
      await api.get<SecureConnectCall[]>(
        `${CALLS_PATH}/history`
      );

    return response.data;
  },
};

export default secureConnectService;
