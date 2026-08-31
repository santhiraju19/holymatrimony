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

export type AdminAnalyticsMetric =
  | "REGISTERED_USERS"
  | "TOTAL_USERS"
  | "PROFILES_CREATED"
  | "COMPLETED_PROFILES"
  | "INCOMPLETE_PROFILES"
  | "BROWSE_VISIBLE"
  | "PAID_MEMBERSHIPS"
  | "SILVER_MEMBERSHIPS"
  | "GOLD_MEMBERSHIPS"
  | "PLATINUM_MEMBERSHIPS"
  | "SUCCESSFUL_PAYMENTS"
  | "PENDING_PAYMENTS"
  | "FAILED_PAYMENTS"
  | "PERIOD_REVENUE"
  | "LIFETIME_REVENUE";

export interface AdminAnalyticsDetailRow {
  id: string;
  userId?: string | null;

  name?: string | null;
  email?: string | null;
  mobile?: string | null;

  gender?: string | null;
  location?: string | null;

  completionPercentage?: number | null;
  profileCompleted?: boolean | null;
  verificationStatus?: string | null;

  membershipPlan?: string | null;
  membershipStatus?: string | null;

  paymentStatus?: string | null;
  paymentSource?: string | null;
  paymentMethod?: string | null;

  amount?: number | null;

  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;

  registeredAt?: string | null;
  createdAt?: string | null;
  paidAt?: string | null;
  startDate?: string | null;
  expiryDate?: string | null;
}

export interface AdminAnalyticsDetailData {
  metric: AdminAnalyticsMetric;
  title: string;

  from: string;
  to: string;

  totalElements: number;
  page: number;
  size: number;
  totalPages: number;

  rows: AdminAnalyticsDetailRow[];
}
