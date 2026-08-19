"use client";

import {
  Fragment,
} from "react";

import {
  Check,
  Crown,
  Minus,
  Sparkles,
} from "lucide-react";

const features = [
  {
    category: "Profile",
    items: [
      {
        name: "Create Profile",
        free: true,
        silver: true,
        gold: true,
        platinum: true,
      },
      {
        name: "Upload Photos",
        free: true,
        silver: true,
        gold: true,
        platinum: true,
      },
      {
        name: "Profile Verification",
        free: false,
        silver: true,
        gold: true,
        platinum: true,
      },
    ],
  },

  {
    category: "Search",
    items: [
      {
        name: "Basic Search",
        free: true,
        silver: true,
        gold: true,
        platinum: true,
      },
      {
        name: "Advanced Search",
        free: false,
        silver: true,
        gold: true,
        platinum: true,
      },
      {
        name: "Priority Search Results",
        free: false,
        silver: true,
        gold: true,
        platinum: true,
      },
    ],
  },

  {
    category: "Communication",
    items: [
      {
        name: "Express Interest",
        free: true,
        silver: true,
        gold: true,
        platinum: true,
      },
      {
        name: "Unlimited Chat",
        free: false,
        silver: true,
        gold: true,
        platinum: true,
      },
      {
        name: "View Contact Details",
        free: false,
        silver: true,
        gold: true,
        platinum: true,
      },
    ],
  },

  {
    category: "Premium",
    items: [
      {
        name: "Highlighted Profile",
        free: false,
        silver: false,
        gold: true,
        platinum: true,
      },
      {
        name: "Dedicated Relationship Manager",
        free: false,
        silver: false,
        gold: false,
        platinum: true,
      },
      {
        name: "VIP Support",
        free: false,
        silver: false,
        gold: true,
        platinum: true,
      },
    ],
  },
];

function Cell({
  value,
  emphasized = false,
}: {
  value: boolean;
  emphasized?: boolean;
}) {
  return (
    <td
      className={[
        "px-3 py-3 text-center sm:px-4",
        emphasized
          ? "bg-amber-50/35"
          : "",
      ].join(" ")}
    >
      {value ? (
        <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Check
            size={13}
            strokeWidth={3}
          />
        </span>
      ) : (
        <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-slate-300">
          <Minus
            size={13}
          />
        </span>
      )}
    </td>
  );
}

export default function FeatureComparison() {
  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#0B2D5C]">
            <Sparkles
              size={10}
            />
            Compare Benefits
          </div>

          <h2 className="mt-3 text-2xl font-black tracking-[-0.025em] text-[#0B2D5C] sm:text-3xl">
            See what each plan includes
          </h2>

          <p className="mt-2 text-xs leading-6 text-slate-500 sm:text-sm">
            Compare communication, search and premium benefits before choosing your membership.
          </p>
        </div>

        <div className="mt-7 overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#071B36] via-[#0B2D5C] to-[#174A87] text-white">
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.08em] sm:px-5">
                    Features
                  </th>

                  <th className="px-3 py-3.5 text-center text-[10px] font-black sm:px-4">
                    Free
                  </th>

                  <th className="px-3 py-3.5 text-center text-[10px] font-black sm:px-4">
                    Silver
                  </th>

                  <th className="bg-[#D4AF37]/15 px-3 py-3.5 text-center text-[10px] font-black text-[#FFF3BF] sm:px-4">
                    <span className="inline-flex items-center gap-1">
                      <Crown
                        size={11}
                      />
                      Gold
                    </span>
                  </th>

                  <th className="px-3 py-3.5 text-center text-[10px] font-black sm:px-4">
                    Platinum
                  </th>
                </tr>
              </thead>

              <tbody>
                {features.map(
                  (group) => (
                    <Fragment
                      key={
                        group.category
                      }
                    >
                      <tr className="border-t border-slate-100 bg-slate-50/80">
                        <td
                          colSpan={5}
                          className="px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.1em] text-[#B38B19] sm:px-5"
                        >
                          {
                            group.category
                          }
                        </td>
                      </tr>

                      {group.items.map(
                        (item) => (
                          <tr
                            key={
                              item.name
                            }
                            className="border-t border-slate-100 transition hover:bg-slate-50/60"
                          >
                            <td className="px-4 py-3 text-[10px] font-bold text-slate-600 sm:px-5 sm:text-[11px]">
                              {
                                item.name
                              }
                            </td>

                            <Cell
                              value={
                                item.free
                              }
                            />

                            <Cell
                              value={
                                item.silver
                              }
                            />

                            <Cell
                              value={
                                item.gold
                              }
                              emphasized
                            />

                            <Cell
                              value={
                                item.platinum
                              }
                            />
                          </tr>
                        )
                      )}
                    </Fragment>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
