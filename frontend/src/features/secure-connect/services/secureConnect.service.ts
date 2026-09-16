import api from "@/lib/api";

import {
  CallMediaType,
  InitiateSecureConnectCallRequest,
  SecureConnectCall,
  SecureConnectMediaCredentials,
} from "../types";

const CALLS_PATH =
  "/calls";

function callActionPath(
  callId: string,
  action:
    | "accept"
    | "decline"
    | "cancel"
    | "end"
): string {
  return `${CALLS_PATH}/${encodeURIComponent(
    callId
  )}/${action}`;
}

export const secureConnectService = {
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
