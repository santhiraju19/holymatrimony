"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  ChevronDown,
  Crown,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";

import authService, {
  AuthUser,
} from "@/features/auth/services/auth.service";

import NotificationBell from "@/features/notifications/components/NotificationBell";

interface HeaderProps {
  onOpenSidebar: () => void;
}

interface PageDetails {
  path: string;
  title: string;
  subtitle: string;
}

const pageDetails: PageDetails[] = [
  {
    path: "/dashboard/membership",
    title: "My Membership",
    subtitle:
      "Manage your plan, validity and payment history",
  },
  {
    path: "/dashboard",
    title: "Dashboard",
    subtitle:
      "Your matrimony journey at a glance",
  },
  {
    path: "/profile",
    title: "My Profile",
    subtitle:
      "Build a profile that reflects who you are",
  },
  {
    path: "/search",
    title: "Search Profiles",
    subtitle:
      "Discover faith-centred matches",
  },
  {
    path: "/received-interests",
    title: "Received Interests",
    subtitle:
      "Review members interested in your profile",
  },
  {
    path: "/chat",
    title: "Messages",
    subtitle:
      "Continue your private conversations",
  },
  {
    path: "/privacy",
    title: "Privacy Settings",
    subtitle:
      "Control your visibility and communication",
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
  if (user?.fullName?.trim()) {
    return user.fullName.trim();
  }

  if (user?.email?.trim()) {
    return (
      user.email
        .split("@")[0]
        .trim() || "Member"
    );
  }

  return "Member";
}

function getGreeting(): string {
  const hour =
    new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function getCurrentPage(
  pathname: string
): PageDetails {
  const sortedPages = [
    ...pageDetails,
  ].sort(
    (first, second) =>
      second.path.length -
      first.path.length
  );

  return (
    sortedPages.find(
      (item) =>
        pathname === item.path ||
        pathname.startsWith(
          `${item.path}/`
        )
    ) ?? {
      path: pathname,
      title: "Holy Matrimony",
      subtitle:
        "Faith-centred matchmaking",
    }
  );
}

export default function Header({
  onOpenSidebar,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const dropdownRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [
    user,
    setUser,
  ] = useState<AuthUser | null>(
    null
  );

  const [
    profileMenuOpen,
    setProfileMenuOpen,
  ] = useState(false);

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  useEffect(() => {
    setUser(
      authService.getUser()
    );
  }, []);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ): void {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  useEffect(() => {
    setProfileMenuOpen(false);
  }, [pathname]);

  const currentPage =
    useMemo(
      () =>
        getCurrentPage(pathname),
      [pathname]
    );

  async function handleLogout(): Promise<void> {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await authService.logout();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-2xl">
      <div className="flex min-h-[82px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Open dashboard menu"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[#0B2D5C] shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md lg:hidden"
          >
            <Menu size={21} />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-lg font-black tracking-tight text-[#0B2D5C] sm:text-xl lg:text-2xl">
                {currentPage.title}
              </h1>

              <Sparkles
                size={16}
                className="hidden text-[#C89A20] sm:block"
              />
            </div>

            <p className="mt-1 hidden truncate text-sm text-slate-500 sm:block">
              {currentPage.subtitle}
            </p>
          </div>
        </div>

        <div className="hidden max-w-md flex-1 px-8 xl:block">
          <Link
            href="/search"
            className="group flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 text-sm text-slate-500 transition-all hover:border-blue-200 hover:bg-white hover:shadow-md"
          >
            <Search
              size={18}
              className="text-slate-400 transition group-hover:text-[#0B2D5C]"
            />

            <span className="flex-1 truncate">
              Search matches by name,
              profession or location
            </span>

            <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-400">
              Search
            </span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard/membership"
            className="hidden items-center gap-2 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-3.5 py-2 text-xs font-bold text-amber-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:flex"
          >
            <Crown size={15} />

            Membership
          </Link>

          <NotificationBell />

          <div
            ref={dropdownRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setProfileMenuOpen(
                  (current) =>
                    !current
                )
              }
              aria-expanded={
                profileMenuOpen
              }
              aria-label="Open profile menu"
              className="group flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md sm:pr-3"
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E4C558] to-[#A97810] font-black text-[#071B36] shadow-sm">
                {getInitial(user)}

                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
              </div>

              <div className="hidden min-w-0 text-left sm:block">
                <p className="max-w-32 truncate text-xs font-bold text-[#0B2D5C]">
                  {getWelcomeName(
                    user
                  )}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  {getGreeting()}
                </p>
              </div>

              <ChevronDown
                size={15}
                className={[
                  "hidden text-slate-400 transition-transform sm:block",
                  profileMenuOpen
                    ? "rotate-180"
                    : "",
                ].join(" ")}
              />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.20)]">
                <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50 to-amber-50 p-4">
                  <p className="truncate text-sm font-black text-[#0B2D5C]">
                    {getWelcomeName(
                      user
                    )}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {user?.email ||
                      "Holy Matrimony member"}
                  </p>
                </div>

                <div className="p-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-[#0B2D5C]"
                  >
                    <UserRound
                      size={18}
                    />

                    My Profile
                  </Link>

                  <Link
                    href="/privacy"
                    className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-[#0B2D5C]"
                  >
                    <Settings
                      size={18}
                    />

                    Privacy Settings
                  </Link>

                  <Link
                    href="/dashboard/membership"
                    className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-amber-50 hover:text-amber-800"
                  >
                    <Crown size={18} />

                    My Membership
                  </Link>

                  <div className="my-2 border-t border-slate-100" />

                  <button
                    type="button"
                    disabled={loggingOut}
                    onClick={() => {
                      void handleLogout();
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut size={18} />

                    {loggingOut
                      ? "Logging out..."
                      : "Secure Logout"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}