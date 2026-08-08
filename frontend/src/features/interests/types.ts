export type InterestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED";

export interface InterestMember {
  userId: string;
  profileId: string | null;
  fullName: string | null;
  gender: string | null;
  age: number | null;
  denomination: string | null;
  profession: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  primaryPhotoId: string | null;
  primaryPhotoUrl: string | null;
}

export interface Interest {
  id: string;
  sender: InterestMember | null;
  receiver: InterestMember | null;
  status: InterestStatus;
  message: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface InterestPage {
  interests: Interest[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface InterestCount {
  pendingReceived: number;
}