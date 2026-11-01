export type FranchiseLeadSource =
  | "WALK_IN"
  | "PHONE"
  | "WHATSAPP"
  | "WEBSITE"
  | "SOCIAL_MEDIA"
  | "REFERRAL"
  | "CHURCH"
  | "EVENT"
  | "OTHER";

export type FranchiseLeadStatus =
  | "NEW"
  | "CONTACTED"
  | "FOLLOW_UP"
  | "QUALIFIED"
  | "CONVERTED"
  | "LOST";

export interface FranchiseLead {
  id: string;
  fullName: string;
  mobile: string;
  email: string | null;
  source: FranchiseLeadSource;
  status: FranchiseLeadStatus;
  notes: string | null;
  territoryId: string | null;
  territoryName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFranchiseLeadRequest {
  fullName: string;
  mobile: string;
  email: string | null;
  source: FranchiseLeadSource;
  notes: string | null;
  territoryId: string | null;
}

export interface UpdateFranchiseLeadRequest {
  fullName: string;
  mobile: string;
  email: string | null;
  source: FranchiseLeadSource;
  status: FranchiseLeadStatus;
  notes: string | null;
  territoryId: string | null;
}
