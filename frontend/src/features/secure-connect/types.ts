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
  connectedAt: string | null;
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

export interface SecureConnectMediaBalance {
  mediaType: CallMediaType;
  canInitiate: boolean;
  unlimited: boolean;
  planAllowanceSeconds: number;
  planConsumedSeconds: number;
  planRemainingSeconds: number;
  topUpRemainingSeconds: number;
  totalRemainingSeconds: number;
}

export interface SecureConnectBalance {
  plan:
    | "FREE"
    | "SILVER"
    | "GOLD"
    | "PLATINUM";

  activeMembership: boolean;

  audio: SecureConnectMediaBalance;

  video: SecureConnectMediaBalance;
}

export type SecureConnectTopUpPaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED";

export interface SecureConnectTopUpPackage {
  packageCode: string;
  mediaType: CallMediaType;
  minutes: number;
  seconds: number;
  amount: number;
  currency: string;
}

export interface CreateSecureConnectTopUpResponse {
  topUpPaymentId: string;
  packageCode: string;
  mediaType: CallMediaType;
  minutes: number;
  seconds: number;
  amount: number;
  currency: string;
  orderId: string;
  key: string;
}

export interface SecureConnectTopUpStatus {
  topUpPaymentId: string;
  mediaType: CallMediaType;
  minutes: number;
  seconds: number;
  amount: number;
  currency: string;
  status: SecureConnectTopUpPaymentStatus;
}

export interface VerifySecureConnectTopUpRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
