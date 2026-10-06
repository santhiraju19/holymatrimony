import {
  BarChart3,
  CreditCard,
  FileWarning,
  LayoutDashboard,
  ShieldCheck,
  UserRoundCheck,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavigationGroup {
  label: string;
  items: AdminNavigationItem[];
}

export const adminNavigation: AdminNavigationGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        label: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Members",
    items: [
      {
        label: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        label: "Profiles",
        href: "/admin/profiles",
        icon: UserRoundCheck,
      },
      {
        label: "Verifications",
        href: "/admin/verifications",
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        label: "Memberships",
        href: "/admin/memberships",
        icon: CreditCard,
      },
      {
        label: "Payments",
        href: "/admin/payments",
        icon: WalletCards,
      },
    ],
  },
  {
    label: "Safety",
    items: [
      {
        label: "Reports",
        href: "/admin/reports",
        icon: FileWarning,
      },
    ],
  },
];

export function isAdminNavigationActive(
  pathname: string,
  href: string
): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
