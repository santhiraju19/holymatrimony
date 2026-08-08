"use client";

import Link from "next/link";

import {
  Eye,
  UserRound,
} from "lucide-react";

import ProfileVerificationBadge from "./ProfileVerificationBadge";

import type {
  AdminProfileListItem,
} from "../types/adminProfile";

interface Props {
  profiles:
    AdminProfileListItem[];
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

  return date.toLocaleString();
}

function locationText(
  profile:
    AdminProfileListItem
): string {
  const parts = [
    profile.city,
    profile.state,
    profile.country,
  ].filter(Boolean);

  return parts.length > 0
    ? parts.join(", ")
    : "—";
}

export default function AdminProfileTable({
  profiles,
}: Props) {
  if (
    profiles.length === 0
  ) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <UserRound
            size={26}
          />
        </div>

        <h3 className="mt-4 text-lg font-bold text-slate-900">
          No profiles found
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          No profiles match the
          current verification
          filter.
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
                Location
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Church
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Completion
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Submitted
              </th>

              <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {profiles.map(
              (profile) => (
                <tr
                  key={
                    profile.profileId
                  }
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-[#0B2D5C]">
                        {profile.primaryPhotoUrl ? (
                          <img
                            src={
                              profile.primaryPhotoUrl
                            }
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserRound
                            size={21}
                          />
                        )}
                      </div>

                      <div>
                        <p className="font-bold text-slate-900">
                          {
                            profile.fullName
                          }
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {
                            profile.email
                          }
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {locationText(
                      profile
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-700">
                      {profile.churchName ||
                        "—"}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {profile.denomination ||
                        "—"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={[
                        "font-bold",
                        profile.completionPercentage ===
                        100
                          ? "text-emerald-700"
                          : "text-amber-700",
                      ].join(
                        " "
                      )}
                    >
                      {
                        profile.completionPercentage ??
                        0
                      }
                      %
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <ProfileVerificationBadge
                      status={
                        profile.verificationStatus
                      }
                    />
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500">
                    {formatDate(
                      profile.verificationSubmittedAt
                    )}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/profiles/${profile.profileId}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-[#0B2D5C] transition hover:border-[#0B2D5C] hover:bg-blue-50"
                    >
                      <Eye
                        size={15}
                      />

                      Review
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