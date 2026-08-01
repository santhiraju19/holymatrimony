"use client";
import React from "react";
import {
  Crown,
  Heart,
  Home,
  LogOut,
  MessageCircle,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import authService from "@/features/auth/services/auth.service";

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "My Profile",
    href: "/profile",
    icon: UserRound,
  },
  {
    name: "Search",
    href: "/search",
    icon: Search,
  },
  {
    name: "Received Interests",
    href: "/received-interests",
    icon: Heart,
  },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageCircle,
  },
  {
    name: "Membership",
    href: "/membership",
    icon: Crown,
  },
  {
    name: "Privacy Settings",
    href: "/privacy",
    icon: ShieldCheck,
  },
];

export default function Sidebar({
  mobile = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [
    loggingOut,
    setLoggingOut,
  ] = React.useState(false);

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

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    await authService.logout();

    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-full flex-col bg-[#0B2D5C] text-white shadow-2xl">
      <div className="flex items-start justify-between border-b border-white/10 p-5 lg:p-6">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="min-w-0"
        >
          <p className="truncate text-2xl font-bold text-[#D4AF37] lg:text-3xl">
            Holy Matrimony
          </p>

          <p className="mt-2 text-sm text-slate-300">
            Faith • Family • Forever
          </p>
        </Link>

        {mobile && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dashboard menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={21} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto p-4 lg:p-5">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={[
                "flex min-h-12 items-center gap-4 rounded-2xl px-4 py-3 text-sm transition-all",
                isActive(item.href)
                  ? "bg-[#D4AF37] font-semibold text-[#0B2D5C] shadow-lg"
                  : "text-slate-200 hover:bg-[#123C73] hover:text-white",
              ].join(" ")}
            >
              <Icon
                size={20}
                className="shrink-0"
              />

              <span className="truncate">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4 lg:p-5">
        <div className="mb-4 rounded-2xl bg-white/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#F2D675]">
            <ShieldCheck size={17} />
            Privacy First
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-300">
            Your photos, contact details,
            presence, and communication are
            protected by your privacy settings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void handleLogout();
          }}
          disabled={loggingOut}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut size={18} />

          {loggingOut
            ? "Logging out..."
            : "Logout"}
        </button>
      </div>
    </aside>
  );
}