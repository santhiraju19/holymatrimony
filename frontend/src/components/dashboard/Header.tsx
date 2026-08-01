"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Menu,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

import authService, {
  AuthUser,
} from "@/features/auth/services/auth.service";

import NotificationBell from "@/features/notifications/components/NotificationBell";

interface HeaderProps {
  onOpenSidebar: () => void;
}

const pageTitles: Array<{
  path: string;
  title: string;
}> = [
  {
    path: "/dashboard",
    title: "Dashboard",
  },
  {
    path: "/profile",
    title: "My Profile",
  },
  {
    path: "/search",
    title: "Search Profiles",
  },
  {
    path: "/received-interests",
    title: "Received Interests",
  },
  {
    path: "/chat",
    title: "Messages",
  },
  {
    path: "/membership",
    title: "Membership",
  },
  {
    path: "/privacy",
    title: "Privacy Settings",
  },
];

function getInitial(
  user: AuthUser | null
): string {
  const value =
    user?.fullName?.trim() ||
    user?.email?.trim() ||
    "M";

  return value
    .charAt(0)
    .toUpperCase();
}

function getWelcomeName(
  user: AuthUser | null
): string {
  if (
    user?.fullName &&
    user.fullName.trim()
  ) {
    return user.fullName.trim();
  }

  if (user?.email) {
    return user.email.split("@")[0];
  }

  return "Member";
}

export default function Header({
  onOpenSidebar,
}: HeaderProps) {
  const pathname = usePathname();

  const [
    user,
    setUser,
  ] = useState<AuthUser | null>(
    null
  );

  useEffect(() => {
    setUser(
      authService.getUser()
    );
  }, []);

  const pageTitle = useMemo(() => {
    return (
      pageTitles.find(
        (item) =>
          pathname === item.path ||
          pathname.startsWith(
            `${item.path}/`
          )
      )?.title ?? "Holy Matrimony"
    );
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 flex min-h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open dashboard menu"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0B2D5C] transition hover:border-blue-300 hover:bg-blue-50 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0 py-3">
          <h1 className="truncate text-lg font-bold text-[#0B2D5C] sm:text-xl lg:text-2xl">
            {pageTitle}
          </h1>

          <p className="hidden truncate text-sm text-slate-500 sm:block">
            Welcome back,{" "}
            {getWelcomeName(user)} 👋
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <NotificationBell />

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] font-bold text-white shadow-sm sm:h-11 sm:w-11"
          title={
            user?.fullName ||
            user?.email ||
            "Holy Matrimony member"
          }
        >
          {getInitial(user)}
        </div>
      </div>
    </header>
  );
}