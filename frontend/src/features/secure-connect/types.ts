export type CallMediaType =
  | "AUDIO"
  | "VIDEO";

export type CallStatus =
  | "RINGING"
  | "ACCEPTED"
  | "DECLINED"
  | "MISSED"
  | "CANCELLED"
  | "ENDED"
  | "FAILED";

export type SecureConnectCallEventType =
  | "CALL_INCOMING"
  | "CALL_ACCEPTED"
  | "CALL_DECLINED"
  | "CALL_CANCELLED"
  | "CALL_ENDED"
  | "CALL_MISSED"
  | "CALL_FAILED";

export interface SecureConnectMember {
  userId: string;
  memberId: string | null;
  displayName: string | null;
}

export interface SecureConnectCall {
  callId: string;
  callerUserId: string;
  calleeUserId: string;
  mediaType: CallMediaType;
  status: CallStatus;
  initiatedAt: string;
  answeredAt: string | null;
  endedAt: string | null;
  durationSeconds: number | null;
}

export interface InitiateSecureConnectCallRequest {
  calleeUserId: string;
  mediaType: CallMediaType;
}

export interface SecureConnectCallEvent {
  eventType: SecureConnectCallEventType;
  callId: string;
  mediaType: CallMediaType;
  status: CallStatus;
  otherMember: SecureConnectMember | null;
  occurredAt: string;
}

export interface SecureConnectMediaCredentials {
  serverUrl: string;
  participantToken: string;
  roomName: string;
  participantIdentity: string;
  mediaType: CallMediaType;
}

export type SecureConnectSocketStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export type SecureConnectCallDirection =
  | "incoming"
  | "outgoing";

export interface SecureConnectActiveCall {
  call: SecureConnectCall;
  direction: SecureConnectCallDirection;
  otherMember: SecureConnectMember | null;
}
