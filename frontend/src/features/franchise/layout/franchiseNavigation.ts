import type {
  FranchisePermission,
} from "../types/franchiseAccess";

export interface FranchiseNavigationItem {
  label: string;
  href: string;
  permission: FranchisePermission;
}

export const franchiseNavigation: FranchiseNavigationItem[] = [
  {
    label: "Dashboard",
    href: "/franchise",
    permission: "DASHBOARD_VIEW",
  },
  {
    label: "Leads",
    href: "/franchise/leads",
    permission: "LEADS_VIEW",
  },
  {
    label: "Members",
    href: "/franchise/members",
    permission: "MEMBERS_VIEW",
  },
  {
    label: "Territories",
    href: "/franchise/territories",
    permission: "TERRITORIES_VIEW",
  },
  {
    label: "Payments",
    href: "/franchise/payments",
    permission: "PAYMENTS_VIEW",
  },
  {
    label: "Commissions",
    href: "/franchise/commissions",
    permission: "COMMISSIONS_VIEW",
  },
  {
    label: "Reports",
    href: "/franchise/reports",
    permission: "REPORTS_VIEW",
  },
  {
    label: "Analytics",
    href: "/franchise/analytics",
    permission: "ANALYTICS_VIEW",
  },
  {
    label: "Staff",
    href: "/franchise/staff",
    permission: "STAFF_MANAGE",
  },
];

export function canAccessFranchiseNavigationItem(
  permissions: readonly FranchisePermission[],
  item: FranchiseNavigationItem
): boolean {
  return permissions.includes(
    item.permission
  );
}

export function getAccessibleFranchiseNavigation(
  permissions: readonly FranchisePermission[]
): FranchiseNavigationItem[] {
  return franchiseNavigation.filter(
    (item) =>
      canAccessFranchiseNavigationItem(
        permissions,
        item
      )
  );
}

export function isFranchiseNavigationActive(
  pathname: string,
  href: string
): boolean {
  if (href === "/franchise") {
    return pathname === "/franchise";
  }

  return (
    pathname === href ||
    pathname.startsWith(
      `${href}/`
    )
  );
}

export function getFranchiseNavigationItemForPath(
  pathname: string
): FranchiseNavigationItem | null {
  const matchingItems =
    franchiseNavigation
      .filter((item) =>
        isFranchiseNavigationActive(
          pathname,
          item.href
        )
      )
      .sort(
        (left, right) =>
          right.href.length -
          left.href.length
      );

  return matchingItems[0] ?? null;
}

export function getFirstAccessibleFranchiseHref(
  permissions: readonly FranchisePermission[]
): string | null {
  return (
    getAccessibleFranchiseNavigation(
      permissions
    )[0]?.href ?? null
  );
}
