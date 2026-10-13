import {
  BarChart3,
  CreditCard,
  FileWarning,
  LayoutDashboard,
  ShieldCheck,
  UserCog,
  UserRoundCheck,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import type {
  AdminAccess,
  AdminPermission,
} from "../access/types";

export interface AdminNavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  requiredPermission?: AdminPermission;
  superAdminOnly?: boolean;
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
        requiredPermission: "DASHBOARD_VIEW",
      },
      {
        label: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
        requiredPermission: "ANALYTICS_VIEW",
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
        requiredPermission: "USERS_MANAGE",
      },
      {
        label: "Profiles",
        href: "/admin/profiles",
        icon: UserRoundCheck,
        requiredPermission: "PROFILES_MANAGE",
      },
      {
        label: "Verifications",
        href: "/admin/verifications",
        icon: ShieldCheck,
        requiredPermission: "VERIFICATIONS_MANAGE",
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
        requiredPermission: "MEMBERSHIPS_VIEW",
      },
      {
        label: "Payments",
        href: "/admin/payments",
        icon: WalletCards,
        requiredPermission: "PAYMENTS_VIEW",
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
        requiredPermission: "REPORTS_MANAGE",
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        label: "Admin Users",
        href: "/admin/admin-users",
        icon: UserCog,
        superAdminOnly: true,
      },
    ],
  },
];

export function canAccessAdminNavigationItem(
  access: AdminAccess,
  item: AdminNavigationItem
): boolean {
  if (access.accessLevel === "SUPER_ADMIN") {
    return true;
  }

  if (item.superAdminOnly) {
    return false;
  }

  if (!item.requiredPermission) {
    return true;
  }

  return access.permissions.includes(
    item.requiredPermission
  );
}

export function getAccessibleAdminNavigation(
  access: AdminAccess
): AdminNavigationGroup[] {
  return adminNavigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        canAccessAdminNavigationItem(
          access,
          item
        )
      ),
    }))
    .filter((group) => group.items.length > 0);
}

export function getFirstAccessibleAdminHref(
  access: AdminAccess
): string | null {
  const groups =
    getAccessibleAdminNavigation(access);

  return groups[0]?.items[0]?.href ?? null;
}

export function getAdminNavigationItemForPath(
  pathname: string
): AdminNavigationItem | null {
  for (const group of adminNavigation) {
    for (const item of group.items) {
      if (
        isAdminNavigationActive(
          pathname,
          item.href
        )
      ) {
        return item;
      }
    }
  }

  return null;
}

export function isAdminNavigationActive(
  pathname: string,
  href: string
): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}
