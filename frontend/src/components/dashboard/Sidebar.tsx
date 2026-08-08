"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";



import {
  usePathname,
  useRouter,
} from "next/navigation";



import {
  Bookmark,
  ChevronDown,
  Crown,
  Heart,
  Home,
  Loader2,
  LockKeyhole,
  LogOut,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";



import authService, {
  AuthUser,
} from "@/features/auth/services/auth.service";

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

interface MenuChild {
  name: string;
  description: string;
  href: string;
  icon: typeof Home;
}

interface MenuItem {
  name: string;
  description: string;
  href?: string;
  icon: typeof Home;
  badge?: string;
  children?: MenuChild[];
}

const menuItems: MenuItem[] = [
  {
    name: "Dashboard",
    description: "Overview and activity",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "My Profile",
    description: "Manage your information",
    href: "/profile",
    icon: UserRound,
  },
  {
    name: "Search",
    description: "Discover suitable matches",
    href: "/search",
    icon: Search,
  },
  {
  name: "Interests",
  description: "Sent and received interests",
  icon: Heart,
  children: [
    {
      name: "Received Interests",
      description: "Review member interests",
      href: "/received-interests",
      icon: Heart,
    },
    {
      name: "Sent Interests",
      description: "Track interests you sent",
      href: "/sent-interests",
      icon: Send,
    },
  ],
},
{
  name: "My Shortlists",
  description: "Saved member profiles",
  href: "/shortlists",
  icon: Bookmark,
},
{
  name: "Chat",
  description: "Private conversations",
  href: "/chat",
  icon: MessageCircle,
},
  {
    name: "Membership",
    description: "Manage your subscription",
    href: "/dashboard/membership",
    icon: Crown,
    badge: "Premium",
  },
  {
    name: "Privacy Settings",
    description: "Control your visibility",
    href: "/privacy",
    icon: LockKeyhole,
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

function getDisplayName(
  user: AuthUser | null
): string {
  if (user?.fullName?.trim()) {
    return user.fullName.trim();
  }

  if (user?.email?.trim()) {
    return user.email
      .split("@")[0]
      .trim();
  }

  return "Holy Matrimony Member";
}

export default function Sidebar({
  mobile = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const interestsRouteActive =
    pathname === "/received-interests" ||
    pathname.startsWith(
      "/received-interests/"
    ) ||
    pathname === "/sent-interests" ||
    pathname.startsWith(
      "/sent-interests/"
    );

  const [
    expanded,
    setExpanded,
  ] = useState(mobile);

  const [
    interestsOpen,
    setInterestsOpen,
  ] = useState(
    interestsRouteActive
  );

  const [
    user,
    setUser,
  ] = useState<AuthUser | null>(
    null
  );

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
    if (mobile) {
      setExpanded(true);
    }
  }, [mobile]);

  useEffect(() => {
    if (interestsRouteActive) {
      setInterestsOpen(true);
    }
  }, [interestsRouteActive]);

  function isActive(
    href: string
  ): boolean {
    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  }

  async function handleLogout(): Promise<void> {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await authService.logout();
    } finally {
      onClose?.();

      router.replace("/login");
      router.refresh();
    }
  }

  const showLabels =
    mobile || expanded;

  return (
    <aside
      onMouseEnter={() => {
        if (!mobile) {
          setExpanded(true);
        }
      }}
      onMouseLeave={() => {
        if (!mobile) {
          setExpanded(false);
        }
      }}
      className={[
        "relative flex h-full flex-col overflow-hidden bg-[#071B36] text-white",
        "transition-[width,box-shadow] duration-300 ease-out",
        mobile
          ? "w-full shadow-2xl"
          : expanded
            ? "w-[300px] shadow-[24px_0_70px_rgba(2,12,27,0.28)]"
            : "w-[84px] shadow-[10px_0_35px_rgba(2,12,27,0.16)]",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute -left-20 -top-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#D4AF37]/15 blur-3xl" />

      <div
        className={[
          "relative flex min-h-[82px] items-center border-b border-white/10",
          showLabels
            ? "justify-between px-5"
            : "justify-center px-3",
        ].join(" ")}
      >
        <Link
          href="/dashboard"
          onClick={onClose}
          className={[
            "group flex min-w-0 items-center",
            showLabels
              ? "gap-3"
              : "justify-center",
          ].join(" ")}
        >
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#F2D675]/30 bg-gradient-to-br from-[#E5C85A] to-[#A8780D] text-[#071B36] shadow-[0_12px_30px_rgba(212,175,55,0.25)] transition-transform duration-300 group-hover:-translate-y-0.5">
            <Heart
              size={23}
              fill="currentColor"
            />

            <Sparkles
              size={13}
              className="absolute -right-1 -top-1 text-white"
            />
          </div>

          <div
            className={[
              "min-w-0 overflow-hidden transition-all duration-300",
              showLabels
                ? "w-44 opacity-100"
                : "w-0 opacity-0",
            ].join(" ")}
          >
            <p className="whitespace-nowrap text-xl font-black tracking-tight text-white">
              Holy Matrimony
            </p>

            <p className="mt-1 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.16em] text-[#E8CB6A]">
              Faith • Family • Forever
            </p>
          </div>
        </Link>

        {mobile && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dashboard menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white transition hover:rotate-90 hover:bg-white/20"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div
        className={[
          "relative pt-4 transition-all duration-300",
          showLabels
            ? "px-4"
            : "px-3",
        ].join(" ")}
      >
        <div
          className={[
            "overflow-hidden border border-white/10 bg-white/[0.07] shadow-xl backdrop-blur-xl transition-all duration-300",
            showLabels
              ? "rounded-3xl p-4"
              : "rounded-2xl p-2",
          ].join(" ")}
        >
          <div
            className={[
              "flex items-center",
              showLabels
                ? "gap-3"
                : "justify-center",
            ].join(" ")}
          >
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E7C955] to-[#A97A12] text-base font-black text-[#071B36] shadow-lg">
              {getInitial(user)}

              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#071B36] bg-emerald-400" />
            </div>

            <div
              className={[
                "min-w-0 flex-1 overflow-hidden transition-all duration-300",
                showLabels
                  ? "w-auto opacity-100"
                  : "w-0 opacity-0",
              ].join(" ")}
            >
              <p className="truncate text-sm font-bold text-white">
                {getDisplayName(user)}
              </p>

              <p className="mt-1 truncate text-xs text-slate-300">
                {user?.email ||
                  "Verified member"}
              </p>
            </div>

            {showLabels && (
              <ShieldCheck
                size={18}
                className="shrink-0 text-[#E8CB6A]"
              />
            )}
          </div>
        </div>
      </div>

      <nav
        className={[
          "relative mt-4 flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden pb-4",
          showLabels
            ? "px-4"
            : "px-3",
        ].join(" ")}
      >
        {showLabels && (
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Main menu
          </p>
        )}

        {menuItems.map((item) => {
          const Icon = item.icon;

          const childActive =
            item.children?.some(
              (child) =>
                isActive(
                  child.href
                )
            ) ?? false;

          const active =
            item.href
              ? isActive(item.href)
              : childActive;

          if (item.children) {
            return (
              <div
                key={item.name}
                className="space-y-1.5"
              >
                <button
                  type="button"
                  aria-expanded={
                    interestsOpen
                  }
                  title={
                    showLabels
                      ? undefined
                      : item.name
                  }
                  onClick={() => {
                    if (!showLabels) {
                      setExpanded(true);
                      setInterestsOpen(true);
                      return;
                    }

                    setInterestsOpen(
                      (current) =>
                        !current
                    );
                  }}
                  className={[
                    "group relative flex min-h-[56px] w-full items-center overflow-hidden rounded-2xl text-left transition-all duration-300",
                    showLabels
                      ? "gap-3 px-3.5 py-2.5"
                      : "justify-center px-2 py-2.5",
                    active
                      ? "bg-white/[0.10] text-white"
                      : "text-slate-300 hover:bg-white/[0.08] hover:text-white",
                  ].join(" ")}
                >
                  {active && (
                    <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-[#D4AF37]" />
                  )}

                  <div
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300",
                      active
                        ? "border-[#D4AF37]/30 bg-[#D4AF37]/15 text-[#F2D675]"
                        : "border-white/10 bg-white/[0.06] text-slate-300 group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-[#F2D675]",
                    ].join(" ")}
                  >
                    <Icon size={19} />
                  </div>

                  <div
                    className={[
                      "min-w-0 flex-1 overflow-hidden transition-all duration-300",
                      showLabels
                        ? "w-auto opacity-100"
                        : "w-0 opacity-0",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate whitespace-nowrap text-sm font-bold">
                        {item.name}
                      </span>

                      <ChevronDown
                        size={17}
                        className={[
                          "shrink-0 transition-transform duration-200",
                          interestsOpen
                            ? "rotate-180"
                            : "",
                        ].join(" ")}
                      />
                    </div>

                    <p className="mt-0.5 truncate whitespace-nowrap text-[11px] text-slate-500 group-hover:text-slate-300">
                      {item.description}
                    </p>
                  </div>
                </button>

                {showLabels &&
                  interestsOpen && (
                    <div className="ml-5 space-y-1 border-l border-white/10 pl-4">
                      {item.children.map(
                        (child) => {
                          const ChildIcon =
                            child.icon;

                          const childIsActive =
                            isActive(
                              child.href
                            );

                          return (
                            <Link
                              key={
                                child.href
                              }
                              href={
                                child.href
                              }
                              onClick={
                                onClose
                              }
                              aria-current={
                                childIsActive
                                  ? "page"
                                  : undefined
                              }
                              className={[
                                "group flex min-h-[50px] items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200",
                                childIsActive
                                  ? "bg-gradient-to-r from-[#D4AF37] to-[#F0D576] text-[#071B36] shadow-[0_10px_24px_rgba(212,175,55,0.18)]"
                                  : "text-slate-400 hover:bg-white/[0.07] hover:text-white",
                              ].join(
                                " "
                              )}
                            >
                              <div
                                className={[
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                  childIsActive
                                    ? "bg-[#071B36]/10 text-[#071B36]"
                                    : "bg-white/[0.06] text-slate-400 group-hover:text-[#F2D675]",
                                ].join(
                                  " "
                                )}
                              >
                                <ChildIcon
                                  size={16}
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold">
                                  {
                                    child.name
                                  }
                                </p>

                                <p
                                  className={[
                                    "truncate text-[10px]",
                                    childIsActive
                                      ? "text-[#071B36]/65"
                                      : "text-slate-500",
                                  ].join(
                                    " "
                                  )}
                                >
                                  {
                                    child.description
                                  }
                                </p>
                              </div>
                            </Link>
                          );
                        }
                      )}
                    </div>
                  )}
              </div>
            );
          }

          if (!item.href) {
            return null;
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={
                active
                  ? "page"
                  : undefined
              }
              title={
                showLabels
                  ? undefined
                  : item.name
              }
              className={[
                "group relative flex min-h-[56px] items-center overflow-hidden rounded-2xl transition-all duration-300",
                showLabels
                  ? "gap-3 px-3.5 py-2.5"
                  : "justify-center px-2 py-2.5",
                active
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#F0D576] text-[#071B36] shadow-[0_12px_30px_rgba(212,175,55,0.22)]"
                  : "text-slate-300 hover:bg-white/[0.08] hover:text-white",
              ].join(" ")}
            >
              {active && (
                <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-[#071B36]" />
              )}

              <div
                className={[
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300",
                  active
                    ? "border-[#071B36]/10 bg-[#071B36]/10 text-[#071B36]"
                    : "border-white/10 bg-white/[0.06] text-slate-300 group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-[#F2D675]",
                ].join(" ")}
              >
                <Icon size={19} />
              </div>

              <div
                className={[
                  "min-w-0 flex-1 overflow-hidden transition-all duration-300",
                  showLabels
                    ? "w-auto opacity-100"
                    : "w-0 opacity-0",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <span className="truncate whitespace-nowrap text-sm font-bold">
                    {item.name}
                  </span>

                  {item.badge && (
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide",
                        active
                          ? "bg-[#071B36]/10 text-[#071B36]"
                          : "bg-[#D4AF37]/15 text-[#F2D675]",
                      ].join(" ")}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                <p
                  className={[
                    "mt-0.5 truncate whitespace-nowrap text-[11px]",
                    active
                      ? "text-[#071B36]/70"
                      : "text-slate-500 group-hover:text-slate-300",
                  ].join(" ")}
                >
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>

      <div
        className={[
          "relative border-t border-white/10 transition-all duration-300",
          showLabels
            ? "p-4"
            : "p-3",
        ].join(" ")}
      >
        {showLabels && (
          <div className="mb-3 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F2D675]">
              <Crown size={16} />

              Unlock premium benefits
            </div>

            <p className="mt-1.5 text-[11px] leading-5 text-slate-300">
              Connect faster with enhanced
              visibility and member access.
            </p>
          </div>
        )}

        <button
          type="button"
          title={
            showLabels
              ? undefined
              : "Secure Logout"
          }
          onClick={() => {
            void handleLogout();
          }}
          disabled={loggingOut}
          className={[
            "group flex min-h-12 w-full items-center rounded-2xl border border-white/15 bg-white/[0.06] text-sm font-bold text-slate-200 transition-all hover:border-red-300/30 hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60",
            showLabels
              ? "justify-center gap-2 px-4 py-3"
              : "justify-center px-2 py-3",
          ].join(" ")}
        >
          {loggingOut ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            <LogOut size={18} />
          )}

          <span
            className={[
              "overflow-hidden whitespace-nowrap transition-all duration-300",
              showLabels
                ? "w-auto opacity-100"
                : "w-0 opacity-0",
            ].join(" ")}
          >
            {loggingOut
              ? "Logging out..."
              : "Secure Logout"}
          </span>
        </button>
      </div>
    </aside>
  );
}