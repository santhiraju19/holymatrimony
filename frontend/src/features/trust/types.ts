export interface TrustItem {
  id: string;
  title: string;
  description?: string;
  verified: boolean;
}

export interface TrustPassport {
  score: number;
  level: string;
  lastUpdated: string;
  items: TrustItem[];
}