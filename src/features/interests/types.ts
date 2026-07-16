export interface Interest {
  id: number;
  memberId: number;
  memberName: string;
  status: "Pending" | "Accepted" | "Rejected";
  sentAt: string;
}