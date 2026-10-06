"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  HeartHandshake,
} from "lucide-react";

import {
  adminNavigation,
  isAdminNavigationActive,
} from "./adminNavigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-200/80 bg-white lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b border-slate-100 px-5 py-6">
          <Link
            href="/admin"
            className="group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-slate-50"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0B2D5C] text-white shadow-sm">
              <HeartHandshake size={22} strokeWidth={2} />
            </div>

            <div className="min-w-0">
              <div className="truncate text-[17px] font-bold tracking-tight text-[#0B2D5C]">
                Holy Matrimony
              </div>

              <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#B78A22]">
                Admin Console
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-6">
            {adminNavigation.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {group.label}
                </p>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isAdminNavigationActive(
                      pathname,
                      item.href
                    );

                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={
                          active ? "page" : undefined
                        }
                        className={[
                          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                          active
                            ? "bg-[#0B2D5C] text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100 hover:text-[#0B2D5C]",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                            active
                              ? "bg-white/10 text-white"
                              : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-[#0B2D5C]",
                          ].join(" ")}
                        >
                          <Icon
                            size={18}
                            strokeWidth={2}
                          />
                        </span>

                        <span className="min-w-0 truncate">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        <div className="border-t border-slate-100 p-4">
          <Link
            href="/"
            className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#0B2D5C]/30 hover:bg-slate-50 hover:text-[#0B2D5C]"
          >
            <span>Back to Website</span>

            <ExternalLink
              size={16}
              className="shrink-0 text-slate-400 transition group-hover:text-[#0B2D5C]"
            />
          </Link>
        </div>
      </div>
    </aside>
  );
}
