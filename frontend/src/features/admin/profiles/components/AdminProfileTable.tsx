"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  UserRound,
} from "lucide-react";

import HomepageFeatureControl from "./HomepageFeatureControl";
import ProfileVerificationBadge from "./ProfileVerificationBadge";

import type {
  AdminProfileListItem,
} from "../types/adminProfile";

interface Props {
  profiles: AdminProfileListItem[];
  updatingProfileId?: string | null;
  onToggleHomepage: (
    profile: AdminProfileListItem
  ) => void;
}

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function locationText(
  profile: AdminProfileListItem
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

function ProfileStatusBadge({
  completed,
}: {
  completed?: boolean | null;
}) {
  if (completed) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
        <CheckCircle2 size={14} />
        Completed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
      Incomplete
    </span>
  );
}

function BrowseStatusBadge({
  visible,
}: {
  visible?: boolean | null;
}) {
  if (visible) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-200">
        <Eye size={14} />
        Live
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-200">
      <EyeOff size={14} />
      Hidden
    </span>
  );
}

export default function AdminProfileTable({
  profiles,
  updatingProfileId = null,
  onToggleHomepage,
}: Props) {
  if (profiles.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <UserRound size={26} />
        </div>

        <h3 className="mt-4 text-lg font-bold text-slate-900">
          No profiles found
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          No profiles match the current search or filter.
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
                Completion
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Profile Status
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Browse
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Homepage
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Verification
              </th>

              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Registered
              </th>

              <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {profiles.map(
              (profile) => {
                const completion =
                  Math.max(
                    0,
                    Math.min(
                      100,
                      profile.completionPercentage ??
                        0
                    )
                  );

                const completed =
                  Boolean(
                    profile.profileCompleted
                  );

                const featured =
                  Boolean(
                    profile.featuredOnHomepage
                  );

                const canFeature =
                  completed &&
                  Boolean(
                    profile.primaryPhotoUrl
                  );

                return (
                  <tr
                    key={
                      profile.profileId
                    }
                    className="align-top transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="min-w-[180px]">
                        <p className="font-bold text-slate-900">
                          {profile.fullName ||
                            "Unnamed member"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {profile.email ||
                            "—"}
                        </p>

                        {profile.mobile && (
                          <p className="mt-1 text-xs text-slate-400">
                            {profile.mobile}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="min-w-[160px] text-sm text-slate-600">
                        {locationText(
                          profile
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="min-w-[135px]">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-bold text-slate-800">
                            {completion}%
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[#0B2D5C]"
                            style={{
                              width: `${completion}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <ProfileStatusBadge
                        completed={
                          completed
                        }
                      />
                    </td>

                    <td className="px-5 py-4">
                      <BrowseStatusBadge
                        visible={
                          completed
                        }
                      />
                    </td>

                    <td className="px-5 py-4">
                      <HomepageFeatureControl
                        featured={
                          featured
                        }
                        disabled={
                          !featured &&
                          !canFeature
                        }
                        loading={
                          updatingProfileId ===
                          profile.profileId
                        }
                        onToggle={() =>
                          onToggleHomepage(
                            profile
                          )
                        }
                      />
                    </td>

                    <td className="px-5 py-4">
                      <ProfileVerificationBadge
                        status={
                          profile.verificationStatus
                        }
                      />
                    </td>

                    <td className="px-5 py-4">
                      <div className="min-w-[115px] text-sm font-medium text-slate-600">
                        {formatDate(
                          profile.createdAt
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/profiles/${profile.profileId}`}
                        className="inline-flex items-center justify-center rounded-xl bg-[#0B2D5C] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#123f78]"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
