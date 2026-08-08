"use client";

import Link from "next/link";

import {
  CalendarDays,
  CreditCard,
  Eye,
  UserRound,
} from "lucide-react";

import MembershipStatusBadge from "./MembershipStatusBadge";

import type {
  AdminMembership,
  MembershipPlan,
} from "../types/adminMembership";

interface Props {
  memberships:
    AdminMembership[];
}

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

function formatCycle(
  cycle: string
): string {
  return cycle
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function planClasses(
  plan: MembershipPlan
): string {
  switch (plan) {
    case "SILVER":
      return "bg-slate-100 text-slate-700";

    case "GOLD":
      return "bg-amber-100 text-amber-800";

    case "PLATINUM":
      return "bg-violet-100 text-violet-800";

    default:
      return "bg-blue-100 text-blue-700";
  }
}

export default function AdminMembershipTable({
  memberships,
}: Props) {
  if (
    memberships.length === 0
  ) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <CreditCard
            size={27}
          />
        </div>

        <h3 className="mt-4 text-lg font-bold text-slate-900">
          No memberships found
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          No membership records
          match the current
          filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Member
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Plan
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Billing
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Started
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Expires
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Remaining
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Payment
              </th>

              <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {memberships.map(
              (membership) => (
                <tr
                  key={
                    membership.membershipId
                  }
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
                        <UserRound
                          size={21}
                        />
                      </div>

                      <div>
                        <p className="font-bold text-slate-900">
                          {
                            membership.fullName
                          }
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {
                            membership.email
                          }
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={[
                        "inline-flex rounded-full px-3 py-1 text-xs font-black",
                        planClasses(
                          membership.plan
                        ),
                      ].join(
                        " "
                      )}
                    >
                      {
                        membership.plan
                      }
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                    {formatCycle(
                      membership.billingCycle
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <MembershipStatusBadge
                      status={
                        membership.status
                      }
                    />
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500">
                    {formatDate(
                      membership.startDate
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500">
                    {formatDate(
                      membership.expiryDate
                    )}
                  </td>

                  <td className="px-5 py-4">
                    {membership.status ===
                    "ACTIVE" ? (
                      <div className="inline-flex items-center gap-2 font-bold text-emerald-700">
                        <CalendarDays
                          size={16}
                        />

                        {
                          membership.daysRemaining
                        }{" "}
                        days
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">
                        —
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    {membership.paymentId ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        <CreditCard
                          size={14}
                        />

                        Linked
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">
                        Waived / Manual
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/memberships/${membership.membershipId}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-[#0B2D5C] transition hover:border-[#0B2D5C] hover:bg-blue-50"
                    >
                      <Eye
                        size={15}
                      />

                      View
                    </Link>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}