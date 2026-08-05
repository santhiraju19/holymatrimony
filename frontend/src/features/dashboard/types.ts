export interface DashboardStat {
  id: string;
  label: string;
  value: number | string;
  description: string;
  href: string;
  tone:
    | "blue"
    | "rose"
    | "emerald"
    | "amber";
}

export interface DashboardQuickAction {
  title: string;
  description: string;
  href: string;
  icon:
    | "profile"
    | "search"
    | "interests"
    | "chat";
}

export interface DashboardNotificationSummary {
  total: number;
  unread: number;
  messages: number;
  interests: number;
}

export interface DashboardNotificationLike {
  type?: string;
  read?: boolean;
}

export interface RecommendedMatch {
  id: string;
  name: string;
  age: number;
  profession: string;
  denomination: string;
  location: string;
  imageUrl?: string | null;
  verified?: boolean;
  churchVerified?: boolean;
}