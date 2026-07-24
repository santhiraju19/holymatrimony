export type CallType = "audio" | "video";

export type CallRequestStatus =
  | "Pending"
  | "Accepted"
  | "Declined"
  | "Cancelled"
  | "Completed"
  | "Expired";

export interface CallRequest {
  id: string;

  memberId: number;
  memberName: string;

  type: CallType;

  requestedDate: string;
  requestedTime: string;

  duration: number;

  message?: string;

  status: CallRequestStatus;

  createdAt: string;
}