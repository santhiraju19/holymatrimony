"use client";

import {
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import {
  LogIn,
  Menu,
  Search,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

import Button from "@/components/ui/Button";

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

export default function Navbar() {
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  useEffect(() => {
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

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-24">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3"
            aria-label="Holy Matrimony home"
          >
 <div className="hm-logo h-[72px] w-[72px] shrink-0">
  <Image
    src="/logo.png"
    alt="Holy Matrimony"
    fill
    priority
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

          <nav className="hidden items-center gap-7 text-[15px] font-medium text-slate-700 lg:flex">
            {navigationItems.map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "relative py-2 transition hover:text-[#B38B19]",
                    isActive(
                      item.href
                    )
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

          <div className="hidden items-center gap-3 lg:flex">
            <Button
              href="/login"
              variant="outline"
              size="md"
            >
              Login
            </Button>

            <Button
              href="/register"
              size="md"
            >
              Register Free
            </Button>
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                true
              )
            }
            aria-label="Open navigation menu"
            aria-expanded={
              mobileMenuOpen
            }
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0B2D5C] transition hover:border-blue-300 hover:bg-blue-50 lg:hidden"
          >
            <Menu size={23} />
          </button>
        </div>
      </header>

      <div
        className={[
          "fixed inset-0 z-[60] transition lg:hidden",
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
            setMobileMenuOpen(
              false
            )
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
              className="flex items-center gap-3"
              onClick={() =>
                setMobileMenuOpen(
                  false
                )
              }
            >
            <Image
  src="/logo.png"
  alt="Holy Matrimony"
  width={64}
  height={64}
  priority
  className="h-14 w-14 shrink-0 animate-[spin_12s_linear_infinite] rounded-full object-contain lg:h-16 lg:w-16"
/>

              <div>
                <p className="font-bold text-[#0B2D5C]">
                  Holy Matrimony
                </p>

                <p className="text-xs text-[#B38B19]">
                  Faith • Family • Forever
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  false
                )
              }
              aria-label="Close navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            >
              <X size={21} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <nav className="space-y-2">
              {navigationItems.map(
                (item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() =>
                      setMobileMenuOpen(
                        false
                      )
                    }
                    className={[
                      "flex items-center rounded-2xl px-4 py-3.5 text-sm font-semibold transition",
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
                <Sparkles
                  size={18}
                />

                <p className="font-bold">
                  Find your blessed match
                </p>
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Create your profile and
                connect through a secure,
                privacy-first Christian
                matrimony platform.
              </p>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-200 p-5">
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
          </div>
        </aside>
      </div>
    </>
  );
}