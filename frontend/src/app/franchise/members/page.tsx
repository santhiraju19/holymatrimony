"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getFranchiseMembers,
} from "@/features/franchise/api/franchiseApi";

import {
  useFranchiseAccess,
} from "@/features/franchise/access/FranchiseAccessProvider";

import type {
  FranchiseMember,
} from "@/features/franchise/types/franchiseMember";

function displayValue(
  value: string | null | undefined
): string {
  const normalized = value?.trim();

  return normalized
    ? normalized
    : "—";
}

function formatDate(
  value: string | null
): string {
  if (!value) {
    return "—";
  }

  const parsed = new Date(
    `${value}T00:00:00`
  );

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(parsed);
}

function statusLabel(
  value: boolean | null
): string {
  if (value === true) {
    return "Yes";
  }

  if (value === false) {
    return "No";
  }

  return "—";
}

export default function FranchiseMembersPage() {
  const {
    hasPermission,
    loading: accessLoading,
    error: accessError,
    refreshAccess,
  } = useFranchiseAccess();

  const canViewMembers =
    hasPermission(
      "MEMBERS_VIEW"
    );

  const [members, setMembers] =
    useState<FranchiseMember[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadMembers =
    useCallback(
      async () => {
        if (!canViewMembers) {
          return;
        }

        setLoading(true);
        setError(null);

        try {
          const response =
            await getFranchiseMembers();

          setMembers(response);
        } catch {
          setError(
            "Unable to load members. Please try again."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        canViewMembers,
      ]
    );

  useEffect(
    () => {
      if (
        accessLoading ||
        accessError ||
        !canViewMembers
      ) {
        return;
      }

      void loadMembers();
    },
    [
      accessLoading,
      accessError,
      canViewMembers,
      loadMembers,
    ]
  );

  const liveMemberCount =
    useMemo(
      () =>
        members.filter(
          (member) =>
            member.profileLive === true
        ).length,
      [
        members,
      ]
    );

  const completedMemberCount =
    useMemo(
      () =>
        members.filter(
          (member) =>
            member.profileCompleted === true
        ).length,
      [
        members,
      ]
    );

  if (accessLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Members
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Loading franchise access…
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Members
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            View members in your allocated district.
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-900">
            Unable to load franchise access
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {accessError}
          </p>

          <button
            type="button"
            onClick={() => {
              void refreshAccess();
            }}
            className="mt-5 rounded-xl bg-[#0B2D5C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123D73]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!canViewMembers) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Members
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Franchise member access.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-semibold text-amber-900">
            Access restricted
          </h2>

          <p className="mt-2 text-sm text-amber-800">
            Your franchise account does not have permission
            to view members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Members
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Members are limited to your active district
          allocation by the backend.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Members
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {members.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Profile Completed
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {completedMemberCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Live Profiles
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {liveMemberCount}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />

          <div className="mt-5 space-y-3">
            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-900">
            Unable to load members
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              void loadMembers();
            }}
            className="mt-5 rounded-xl bg-[#0B2D5C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123D73]"
          >
            Try Again
          </button>
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            No members found
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            There are currently no canonically assigned
            members in your active district scope.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Member
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contact
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Profile
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Church
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Location
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {members.map(
                  (member) => (
                    <tr
                      key={member.profileId}
                      className="align-top"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {displayValue(
                            member.fullName
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {displayValue(
                            member.memberId
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        <p>
                          {displayValue(
                            member.email
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          DOB:{" "}
                          {formatDate(
                            member.dateOfBirth
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        <p>
                          {displayValue(
                            member.gender
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {displayValue(
                            member.denomination
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {displayValue(
                          member.churchName
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        <p>
                          {displayValue(
                            member.city
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {[
                            member.district,
                            member.state,
                            member.country,
                          ]
                            .filter(
                              (
                                value
                              ): value is string =>
                                Boolean(
                                  value?.trim()
                                )
                            )
                            .join(", ") || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-slate-700">
                            Completed:{" "}
                            <span className="font-medium">
                              {statusLabel(
                                member.profileCompleted
                              )}
                            </span>
                          </p>

                          <p className="text-slate-700">
                            Live:{" "}
                            <span className="font-medium">
                              {statusLabel(
                                member.profileLive
                              )}
                            </span>
                          </p>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
