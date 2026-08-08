"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

import ConfirmStatusModal from "@/features/admin/users/components/ConfirmStatusModal";
import UserStatusBadge from "@/features/admin/users/components/UserStatusBadge";

import {
  getAdminUser,
  updateAdminUserStatus,
} from "@/features/admin/users/services/adminUserService";

import type {
  AdminUserDetail,
  UserStatus,
} from "@/features/admin/users/types/adminUser";

/*
 * ---------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------
 */

function formatDateTime(
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

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

function labelStatus(
  status: UserStatus
): string {
  return status
    .toLowerCase()
    .replace(
      /^\w/,
      (value) =>
        value.toUpperCase()
    );
}

function isValidUuid(
  value: string
): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

/*
 * ---------------------------------------------------------
 * Information item
 * ---------------------------------------------------------
 */

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({
  label,
  value,
}: InfoItemProps) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

/*
 * ---------------------------------------------------------
 * Page
 * ---------------------------------------------------------
 */

export default function AdminUserDetailPage() {
  /*
   * Read the user UUID directly from:
   *
   * /admin/users/{UUID}
   *
   * Example:
   *
   * /admin/users/f0de38dd-a544-4e31-921c-dd8947cd4b5a
   */

  const pathname =
    usePathname();

  const pathSegments =
    pathname
      .split("/")
      .filter(Boolean);

  const userId =
    pathSegments.at(-1) ?? "";

  /*
   * -------------------------------------------------------
   * State
   * -------------------------------------------------------
   */

  const [
    user,
    setUser,
  ] =
    useState<AdminUserDetail | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState<string | null>(
      null
    );

  const [
    selectedStatus,
    setSelectedStatus,
  ] =
    useState<UserStatus>(
      "ACTIVE"
    );

  const [
    reason,
    setReason,
  ] =
    useState("");

  const [
    confirmOpen,
    setConfirmOpen,
  ] =
    useState(false);

  /*
   * -------------------------------------------------------
   * Load user
   * -------------------------------------------------------
   */

  const loadUser =
    useCallback(
      async () => {
        /*
         * Never call Spring with:
         *
         * undefined
         * null
         * users
         * empty ID
         * invalid UUID
         */

        if (
          !userId ||
          !isValidUuid(userId)
        ) {
          setUser(null);

          setError(
            `Invalid user ID: ${userId || "missing"}`
          );

          setLoading(false);

          return;
        }

        try {
          setLoading(true);
          setError(null);

          const response =
            await getAdminUser(
              userId
            );

          setUser(response);

          setSelectedStatus(
            response.status
          );

          setReason(
            response.statusReason ??
              ""
          );
        } catch (err) {
          setUser(null);

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load user."
          );
        } finally {
          setLoading(false);
        }
      },
      [userId]
    );

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  /*
   * -------------------------------------------------------
   * Status actions
   * -------------------------------------------------------
   */

  function handleOpenConfirmation() {
    if (!user) {
      return;
    }

    if (
      selectedStatus ===
      user.status
    ) {
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setConfirmOpen(true);
  }

  function handleCancelConfirmation() {
    if (actionLoading) {
      return;
    }

    setConfirmOpen(false);
  }

  async function confirmStatusUpdate() {
    if (!user) {
      return;
    }

    if (
      selectedStatus ===
      user.status
    ) {
      setConfirmOpen(false);
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);

      const updated =
        await updateAdminUserStatus(
          user.id,
          selectedStatus,
          reason
        );

      setUser(updated);

      setSelectedStatus(
        updated.status
      );

      setReason(
        updated.statusReason ??
          ""
      );

      setConfirmOpen(false);

      setSuccessMessage(
        `User status updated to ${labelStatus(
          updated.status
        )}.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update user status."
      );
    } finally {
      setActionLoading(false);
    }
  }

  /*
   * -------------------------------------------------------
   * Loading
   * -------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0B2D5C]" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading user...
          </p>
        </div>
      </div>
    );
  }

  /*
   * -------------------------------------------------------
   * User unavailable
   * -------------------------------------------------------
   */

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-7">
          <h1 className="text-xl font-bold text-red-800">
            User could not be loaded
          </h1>

          <p className="mt-2 text-sm text-red-700">
            {error ??
              "The requested user could not be found."}
          </p>

          <div className="mt-4 rounded-xl border border-red-100 bg-white/70 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Requested User ID
            </p>

            <p className="mt-2 break-all font-mono text-xs text-slate-700">
              {userId ||
                "No user ID detected"}
            </p>
          </div>

          <Link
            href="/admin/users"
            className="mt-6 inline-flex rounded-xl bg-[#0B2D5C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123C73]"
          >
            ← Back to Users
          </Link>
        </div>
      </div>
    );
  }

  /*
   * -------------------------------------------------------
   * Derived state
   * -------------------------------------------------------
   */

  const statusChanged =
    selectedStatus !==
    user.status;

  const isAdminUser =
    user.role ===
    "ROLE_ADMIN";

  const isRestoring =
    selectedStatus ===
    "ACTIVE";

  /*
   * -------------------------------------------------------
   * Page
   * -------------------------------------------------------
   */

  return (
    <>
      <div className="mx-auto max-w-6xl">
        {/* Back */}

        <div className="mb-7">
          <Link
            href="/admin/users"
            className="text-sm font-semibold text-[#0B2D5C] transition hover:underline"
          >
            ← Back to User Management
          </Link>
        </div>

        {/* User header */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-2xl font-bold text-[#0B2D5C]">
              {user.fullName
                ?.charAt(0)
                .toUpperCase() ||
                "U"}
            </div>

            <div>
              <p className="text-sm font-semibold text-[#B78A22]">
                Member Account
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {user.fullName}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {user.email}
              </p>
            </div>
          </div>

          <UserStatusBadge
            status={user.status}
          />
        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-700">
              Something went wrong
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Success */}

        {successMessage && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="font-semibold text-emerald-700">
              {successMessage}
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Left column */}

          <div className="space-y-6">
            {/* Account */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Account Information
              </h2>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <InfoItem
                  label="Full Name"
                  value={user.fullName}
                />

                <InfoItem
                  label="Email"
                  value={user.email}
                />

                <InfoItem
                  label="Mobile"
                  value={
                    user.mobile ||
                    "Not provided"
                  }
                />

                <InfoItem
                  label="Role"
                  value={
                    user.role ===
                    "ROLE_ADMIN"
                      ? "Administrator"
                      : "Member"
                  }
                />

                <InfoItem
                  label="Membership"
                  value={
                    user.membershipType ||
                    "FREE"
                  }
                />

                <InfoItem
                  label="Profile Completion"
                  value={`${
                    user.profileCompletion ??
                    0
                  }%`}
                />

                <InfoItem
                  label="Account Enabled"
                  value={
                    user.enabled
                      ? "Yes"
                      : "No"
                  }
                />

                <InfoItem
                  label="Email Verified"
                  value={
                    user.emailVerified
                      ? "Yes"
                      : "No"
                  }
                />
              </div>
            </section>

            {/* Activity */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Activity & Verification
              </h2>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <InfoItem
                  label="Joined"
                  value={formatDateTime(
                    user.createdAt
                  )}
                />

                <InfoItem
                  label="Last Updated"
                  value={formatDateTime(
                    user.updatedAt
                  )}
                />

                <InfoItem
                  label="Last Login"
                  value={formatDateTime(
                    user.lastLoginAt
                  )}
                />

                <InfoItem
                  label="Email Verified At"
                  value={formatDateTime(
                    user.emailVerifiedAt
                  )}
                />
              </div>
            </section>

            {/* Status history */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Status History
                </h2>

                <UserStatusBadge
                  status={user.status}
                />
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <InfoItem
                  label="Current Status"
                  value={labelStatus(
                    user.status
                  )}
                />

                <InfoItem
                  label="Changed At"
                  value={formatDateTime(
                    user.statusChangedAt
                  )}
                />

                <InfoItem
                  label="Changed By"
                  value={
                    user.statusChangedBy ||
                    "—"
                  }
                />

                <div className="sm:col-span-2">
                  <InfoItem
                    label="Reason"
                    value={
                      user.statusReason ||
                      "No status change reason recorded."
                    }
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Admin action */}

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B78A22]">
              Administrative Action
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-900">
              Change Account Status
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Suspend, block, deactivate,
              or reactivate a member account.
            </p>

            {/* Status selector */}

            <div className="mt-6">
              <label
                htmlFor="account-status"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Status
              </label>

              <select
                id="account-status"
                value={selectedStatus}
                disabled={
                  actionLoading ||
                  isAdminUser
                }
                onChange={(event) => {
                  setSelectedStatus(
                    event.target
                      .value as UserStatus
                  );

                  setSuccessMessage(
                    null
                  );

                  setError(null);
                }}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
              >
                <option value="ACTIVE">
                  Active
                </option>

                <option value="SUSPENDED">
                  Suspended
                </option>

                <option value="BLOCKED">
                  Blocked
                </option>

                <option value="DEACTIVATED">
                  Deactivated
                </option>
              </select>
            </div>

            {/* Reason */}

            <div className="mt-5">
              <label
                htmlFor="status-reason"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Reason
              </label>

              <textarea
                id="status-reason"
                value={reason}
                disabled={
                  actionLoading ||
                  isAdminUser
                }
                onChange={(event) => {
                  setReason(
                    event.target.value
                  );

                  setSuccessMessage(
                    null
                  );
                }}
                rows={5}
                maxLength={500}
                placeholder="Enter the reason for this administrative action..."
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
              />

              <p className="mt-2 text-right text-xs text-slate-400">
                {reason.length}/500
              </p>
            </div>

            {/* Admin protection */}

            {isAdminUser && (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800">
                  Administrator account
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-700">
                  Administrator status
                  cannot be changed from
                  this screen.
                </p>
              </div>
            )}

            {/* Pending status */}

            {!isAdminUser &&
              statusChanged && (
                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-500">
                    Pending Change
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#0B2D5C]">
                    {labelStatus(
                      user.status
                    )}

                    {" → "}

                    {labelStatus(
                      selectedStatus
                    )}
                  </p>
                </div>
              )}

            {/* Action button */}

            <button
              type="button"
              disabled={
                actionLoading ||
                !statusChanged ||
                isAdminUser
              }
              onClick={
                handleOpenConfirmation
              }
              className={[
                "mt-6 w-full rounded-xl px-5 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50",

                isRestoring
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : selectedStatus ===
                      "BLOCKED"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-[#0B2D5C] hover:bg-[#123C73]",
              ].join(" ")}
            >
              {actionLoading
                ? "Updating..."
                : isRestoring
                  ? "Reactivate Account"
                  : selectedStatus ===
                      "BLOCKED"
                    ? "Block Account"
                    : selectedStatus ===
                        "SUSPENDED"
                      ? "Suspend Account"
                      : selectedStatus ===
                          "DEACTIVATED"
                        ? "Deactivate Account"
                        : "Update Status"}
            </button>
          </aside>
        </div>
      </div>

      {/* Confirmation */}

      <ConfirmStatusModal
        open={confirmOpen}
        userName={user.fullName}
        currentStatus={user.status}
        nextStatus={selectedStatus}
        reason={reason}
        loading={actionLoading}
        onCancel={
          handleCancelConfirmation
        }
        onConfirm={
          confirmStatusUpdate
        }
      />
    </>
  );
}