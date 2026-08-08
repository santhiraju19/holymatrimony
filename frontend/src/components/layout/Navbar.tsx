"use client";

import {
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  LogIn,
  LogOut,
  Menu,
  Search,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import Button from "@/components/ui/button";

import authService, {
  AuthUser,
} from "@/features/auth/services/auth.service";

const navigationItems = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Search",
    href: "/search",
  },
  {
    label: "Membership",
    href: "/membership",
  },
  {
    label: "Success Stories",
    href: "/success-stories",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

function getUserInitial(
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

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [
    loggedIn,
    setLoggedIn,
  ] = useState(false);

  const [
    currentUser,
    setCurrentUser,
  ] = useState<AuthUser | null>(
    null
  );

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  useEffect(() => {
    const authenticated =
      authService.isLoggedIn();

    setLoggedIn(authenticated);

    setCurrentUser(
      authenticated
        ? authService.getUser()
        : null
    );

    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow =
        "";

      return;
    }

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [mobileMenuOpen]);

  function isActive(
    href: string
  ): boolean {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(
      href
    );
  }

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await authService.logout();

      setLoggedIn(false);
      setCurrentUser(null);
      setMobileMenuOpen(false);

      router.replace("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-24">
          <Link
            href="/"
            aria-label="Holy Matrimony home"
            className="flex min-w-0 items-center gap-3"
          >
            <div className="hm-logo relative h-14 w-14 shrink-0 lg:h-16 lg:w-16">
              <Image
                src="/logo.png"
                alt="Holy Matrimony"
                fill
                priority
                sizes="(max-width: 1024px) 56px, 64px"
                className="rounded-full object-contain"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-[#0B2D5C] sm:text-xl lg:text-2xl">
                Holy Matrimony
              </p>

              <p className="hidden text-xs tracking-wide text-[#B38B19] sm:block lg:text-sm">
                Faith • Family • Forever
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-[15px] font-medium text-slate-700 xl:flex">
            {navigationItems.map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "relative py-2 transition hover:text-[#B38B19]",
                    isActive(item.href)
                      ? "font-semibold text-[#0B2D5C]"
                      : "",
                  ].join(" ")}
                >
                  {item.label}

                  {isActive(
                    item.href
                  ) && (
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-[#D4AF37]" />
                  )}
                </Link>
              )
            )}
          </nav>

          <div className="hidden items-center gap-3 xl:flex">
            {loggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D4AF37] font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                  title={
                    currentUser?.fullName ||
                    currentUser?.email ||
                    "Member dashboard"
                  }
                  aria-label="Open dashboard"
                >
                  {getUserInitial(
                    currentUser
                  )}
                </Link>

                <Button
                  href="/dashboard"
                  size="md"
                >
                  Dashboard
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  loading={loggingOut}
                  leftIcon={
                    <LogOut size={17} />
                  }
                  onClick={() => {
                    void handleLogout();
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  href="/login"
                  variant="outline"
                  size="md"
                  leftIcon={
                    <LogIn size={17} />
                  }
                >
                  Login
                </Button>

                <Button
                  href="/register"
                  size="md"
                  leftIcon={
                    <UserPlus size={17} />
                  }
                >
                  Register Free
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(true)
            }
            aria-label="Open navigation menu"
            aria-expanded={
              mobileMenuOpen
            }
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0B2D5C] transition hover:border-blue-300 hover:bg-blue-50 xl:hidden"
          >
            <Menu size={23} />
          </button>
        </div>
      </header>

      <div
        className={[
          "fixed inset-0 z-[60] transition xl:hidden",
          mobileMenuOpen
            ? "pointer-events-auto"
            : "pointer-events-none",
        ].join(" ")}
        aria-hidden={
          !mobileMenuOpen
        }
      >
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() =>
            setMobileMenuOpen(false)
          }
          className={[
            "absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity",
            mobileMenuOpen
              ? "opacity-100"
              : "opacity-0",
          ].join(" ")}
        />

        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className={[
            "absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300",
            mobileMenuOpen
              ? "translate-x-0"
              : "translate-x-full",
          ].join(" ")}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
            <Link
              href="/"
              className="flex min-w-0 items-center gap-3"
            >
              <div className="hm-logo relative h-12 w-12 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Holy Matrimony"
                  fill
                  sizes="48px"
                  className="rounded-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate font-bold text-[#0B2D5C]">
                  Holy Matrimony
                </p>

                <p className="truncate text-xs text-[#B38B19]">
                  Faith • Family • Forever
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              aria-label="Close navigation menu"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            >
              <X size={21} />
            </button>
          </div>

          {loggedIn && (
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3 rounded-2xl bg-blue-50 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] font-bold text-white shadow-sm">
                  {getUserInitial(
                    currentUser
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#0B2D5C]">
                    {currentUser?.fullName ||
                      "Holy Matrimony Member"}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {currentUser?.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <nav className="space-y-2">
              {navigationItems.map(
                (item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "flex min-h-12 items-center rounded-2xl px-4 py-3.5 text-sm font-semibold transition",
                      isActive(
                        item.href
                      )
                        ? "bg-blue-50 text-[#0B2D5C]"
                        : "text-slate-700 hover:bg-slate-100",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            <div className="my-6 border-t border-slate-200" />

            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
              <div className="flex items-center gap-2 text-[#0B2D5C]">
                <Sparkles size={18} />

                <p className="font-bold">
                  Privacy-first matchmaking
                </p>
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Connect through a secure Christian matrimony platform
                while keeping your personal information protected.
              </p>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-200 p-5">
            {loggedIn ? (
              <>
                <Button
                  href="/dashboard"
                  fullWidth
                >
                  Dashboard
                </Button>

                <Button
                  href="/privacy"
                  variant="outline"
                  fullWidth
                >
                  Privacy Settings
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  fullWidth
                  loading={loggingOut}
                  leftIcon={
                    <LogOut size={18} />
                  }
                  onClick={() => {
                    void handleLogout();
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  href="/login"
                  variant="outline"
                  fullWidth
                  leftIcon={
                    <LogIn size={18} />
                  }
                >
                  Login
                </Button>

                <Button
                  href="/register"
                  fullWidth
                  leftIcon={
                    <UserPlus size={18} />
                  }
                >
                  Register Free
                </Button>

                <Button
                  href="/search"
                  variant="ghost"
                  fullWidth
                  leftIcon={
                    <Search size={18} />
                  }
                >
                  Browse Profiles
                </Button>
              </>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}