export interface AdminDashboardData {
  // Users
  totalUsers: number;
  usersToday: number;
  usersLast7Days: number;
  usersThisMonth: number;

  // Profiles
  totalProfiles: number;
  completedProfiles: number;
  incompleteProfiles: number;
  browseVisibleProfiles: number;
  profileCompletionRate: number;

  // Memberships
  totalMemberships: number;
  activePaidMemberships: number;
  activeSilverMemberships: number;
  activeGoldMemberships: number;
  activePlatinumMemberships: number;
  membershipsExpiringIn7Days: number;

  // Payments
  totalPayments: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;

  // Revenue
  revenueToday: number;
  revenueThisMonth: number;
  totalRevenue: number;

  // Matchmaking activity
  totalInterests: number;
  totalMessages: number;

  // Conversion
  registrationToProfileRate: number;
  registrationToPaidRate: number;
}

export interface AdminAnalyticsData {
  from: string;
  to: string;

  registeredUsers: number;
  totalUsers: number;

  profilesCreated: number;
  completedProfiles: number;
  incompleteProfiles: number;
  browseVisibleProfiles: number;

  paidMemberships: number;
  silverMemberships: number;
  goldMemberships: number;
  platinumMemberships: number;

  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;

  periodRevenue: number;
  lifetimeRevenue: number;

  registrationToProfileRate: number;
  registrationToPaidRate: number;
}

export type AdminAnalyticsExportType =
  | "users"
  | "profiles"
  | "memberships"
  | "payments";
