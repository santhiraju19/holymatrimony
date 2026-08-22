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

  age: number | null;

  profession: string | null;

  denomination: string | null;

  location: string | null;

  imageUrl?: string | null;

  compatibilityScore: number | null;

  verified?: boolean | null;

  churchVerified?: boolean | null;
}
