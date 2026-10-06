"use client";

import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  KeyRound,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

import AdminButton from "@/features/admin/components/ui/AdminButton";
import AdminPageHeader from "@/features/admin/components/ui/AdminPageHeader";
import AdminSectionCard from "@/features/admin/components/ui/AdminSectionCard";
import ConfirmStatusModal from "@/features/admin/users/components/ConfirmStatusModal";
import UserStatusBadge from "@/features/admin/users/components/UserStatusBadge";

import {
  getAdminUser,
  sendAdminPasswordResetEmail,
  sendAdminVerificationEmail,
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
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-semibold leading-6 text-slate-800">
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
    emailAction,
    setEmailAction,
  ] =
    useState<
      "verification" |
      "password-reset" |
      null
    >(null);

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
   * Account recovery email actions
   * -------------------------------------------------------
   */

  async function handleSendVerificationEmail() {
    if (
      !user ||
      user.emailVerified ||
      emailAction !== null
    ) {
      return;
    }

    try {
      setEmailAction(
        "verification"
      );

      setError(null);
      setSuccessMessage(null);

      await sendAdminVerificationEmail(
        user.id
      );

      setSuccessMessage(
        "Verification email sent successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send verification email."
      );
    } finally {
      setEmailAction(null);
    }
  }

  async function handleSendPasswordResetEmail() {
    if (
      !user ||
      emailAction !== null
    ) {
      return;
    }

    try {
      setEmailAction(
        "password-reset"
      );

      setError(null);
      setSuccessMessage(null);

      await sendAdminPasswordResetEmail(
        user.id
      );

      setSuccessMessage(
        "Password reset email sent successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send password reset email."
      );
    } finally {
      setEmailAction(null);
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
        <AdminPageHeader
          eyebrow="Member Administration"
          title={user.fullName}
          description={user.email}
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <UserStatusBadge status={user.status} />

              <Link
                href="/admin/users"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#0B2D5C] shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
              >
                <ArrowLeft size={16} />
                Back to Users
              </Link>
            </div>
          }
        >
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg font-black text-[#0B2D5C] ring-1 ring-blue-100">
              {user.fullName?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <UserRound size={14} />
                  {user.role === "ROLE_ADMIN"
                    ? "Administrator"
                    : "Member"}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Mail size={14} />
                  {user.emailVerified
                    ? "Email verified"
                    : "Email verification pending"}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  {user.membershipType || "FREE"} Membership
                </span>
              </div>

              <p className="mt-1.5 font-mono text-[11px] text-slate-400">
                Member ID: {user.id}
              </p>
            </div>
          </div>
        </AdminPageHeader>

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

            <AdminSectionCard
              title="Account Information"
              description="Core member identity, access and membership information."
              icon={UserRound}
            >
              <div className="grid gap-3 sm:grid-cols-2">
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
            </AdminSectionCard>

            {/* Activity */}

            <AdminSectionCard
              title="Activity & Verification"
              description="Account activity timestamps and email verification history."
              icon={CalendarDays}
            >
              <div className="grid gap-3 sm:grid-cols-2">
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
            </AdminSectionCard>

            {/* Status history */}

            <AdminSectionCard
              title="Status History"
              description="Current account state and the most recent administrative status change."
              icon={Clock3}
              actions={
                <UserStatusBadge status={user.status} />
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
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
            </AdminSectionCard>
          </div>

          {/* Admin action */}

          <aside className="h-fit lg:sticky lg:top-28">
            <AdminSectionCard
              title="Change Account Status"
              description="Suspend, block, deactivate or reactivate this member account."
              icon={ShieldCheck}
            >
              {/* Status selector */}

              <div>
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

            </AdminSectionCard>

            <div className="mt-6">
              <AdminSectionCard
                title="Account Recovery"
                description="Help this member complete email verification or securely recover account access."
                icon={KeyRound}
              >
                <div className="space-y-3">
                  <AdminButton
                    type="button"
                    variant="secondary"
                    className="w-full"
                    icon={
                      user.emailVerified ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <Mail size={16} />
                      )
                    }
                    disabled={
                      user.emailVerified ||
                      emailAction !== null
                    }
                    loading={
                      emailAction === "verification"
                    }
                    onClick={
                      handleSendVerificationEmail
                    }
                  >
                    {user.emailVerified
                      ? "Email Already Verified"
                      : "Send Verification Email"}
                  </AdminButton>

                  <AdminButton
                    type="button"
                    variant="secondary"
                    className="w-full"
                    icon={<KeyRound size={16} />}
                    disabled={
                      emailAction !== null
                    }
                    loading={
                      emailAction === "password-reset"
                    }
                    onClick={
                      handleSendPasswordResetEmail
                    }
                  >
                    Send Password Reset Email
                  </AdminButton>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex gap-3">
                    <ShieldCheck
                      size={17}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <p className="text-xs leading-5 text-slate-500">
                      Verification emails contain a fresh verification OTP.
                      Password reset emails contain a secure password-reset OTP.
                      Administrators cannot view or change the member&apos;s
                      password from this screen.
                    </p>
                  </div>
                </div>
              </AdminSectionCard>
            </div>
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