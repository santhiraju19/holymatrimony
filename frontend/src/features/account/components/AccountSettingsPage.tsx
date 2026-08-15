"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Save,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserRound,
} from "lucide-react";

import accountService from "@/features/account/api/account.service";
import authService from "@/features/auth/services/auth.service";

import type {
  Account,
} from "@/features/account/types";

import {
  getApiErrorMessage,
} from "@/lib/api";

export default function AccountSettingsPage() {
  const router = useRouter();

  /*
   * ============================================================
   * ACCOUNT
   * ============================================================
   */

  const [
    account,
    setAccount,
  ] = useState<Account | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    accountError,
    setAccountError,
  ] = useState<string | null>(
    null
  );

  /*
   * ============================================================
   * PROFILE / ACCOUNT DETAILS
   * ============================================================
   */

  const [
    fullName,
    setFullName,
  ] = useState("");

  const [
    mobile,
    setMobile,
  ] = useState("");

  const [
    savingAccount,
    setSavingAccount,
  ] = useState(false);

  const [
    accountSuccess,
    setAccountSuccess,
  ] = useState<string | null>(
    null
  );

  const [
    updateError,
    setUpdateError,
  ] = useState<string | null>(
    null
  );

  /*
   * ============================================================
   * PASSWORD
   * ============================================================
   */

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  const [
    passwordSuccess,
    setPasswordSuccess,
  ] = useState<string | null>(
    null
  );

  const [
    passwordError,
    setPasswordError,
  ] = useState<string | null>(
    null
  );

  /*
   * ============================================================
   * LOGOUT ALL DEVICES
   * ============================================================
   */

  const [
    loggingOutAll,
    setLoggingOutAll,
  ] = useState(false);

  const [
    securityError,
    setSecurityError,
  ] = useState<string | null>(
    null
  );

  /*
   * ============================================================
   * DEACTIVATION
   * ============================================================
   */

  const [
    deactivationPassword,
    setDeactivationPassword,
  ] = useState("");

  const [
    deactivationReason,
    setDeactivationReason,
  ] = useState("");

  const [
    deactivating,
    setDeactivating,
  ] = useState(false);

  const [
    deactivationError,
    setDeactivationError,
  ] = useState<string | null>(
    null
  );

  /*
   * ============================================================
   * PERMANENT DELETE
   * ============================================================
   */

  const [
    deletePassword,
    setDeletePassword,
  ] = useState("");

  const [
    deleteConfirmation,
    setDeleteConfirmation,
  ] = useState("");

  const [
    deletingAccount,
    setDeletingAccount,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState<string | null>(
    null
  );

  /*
   * ============================================================
   * LOAD ACCOUNT
   * ============================================================
   */

  useEffect(() => {
    let mounted = true;

    async function loadAccount() {
      setLoading(true);
      setAccountError(null);

      try {
        const response =
          await accountService.getAccount();

        if (!mounted) {
          return;
        }

        setAccount(response);

        setFullName(
          response.fullName ?? ""
        );

        setMobile(
          response.mobile ?? ""
        );
      } catch (error) {
        if (!mounted) {
          return;
        }

        setAccountError(
          getApiErrorMessage(
            error,
            "Unable to load your account settings."
          )
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadAccount();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ============================================================
   * UPDATE ACCOUNT
   * ============================================================
   */

  async function handleAccountUpdate(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    if (savingAccount) {
      return;
    }

    setAccountSuccess(null);
    setUpdateError(null);

    const normalizedName =
      fullName.trim();

    if (!normalizedName) {
      setUpdateError(
        "Full name is required."
      );

      return;
    }

    setSavingAccount(true);

    try {
      const updated =
        await accountService.updateAccount({
          fullName:
            normalizedName,

          mobile: mobile.trim(),
        });

      setAccount(updated);

      setFullName(
        updated.fullName ?? ""
      );

      setMobile(
        updated.mobile ?? ""
      );

      setAccountSuccess(
        "Account details updated successfully."
      );
    } catch (error) {
      setUpdateError(
        getApiErrorMessage(
          error,
          "Unable to update your account."
        )
      );
    } finally {
      setSavingAccount(false);
    }
  }

  /*
   * ============================================================
   * CHANGE PASSWORD
   * ============================================================
   */

  async function handlePasswordChange(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    if (changingPassword) {
      return;
    }

    setPasswordSuccess(null);
    setPasswordError(null);

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(
        "Complete all password fields."
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setPasswordError(
        "New password and confirmation do not match."
      );

      return;
    }

    setChangingPassword(true);

    try {
      const response =
        await accountService.changePassword({
          currentPassword,
          newPassword,
          confirmPassword,
        });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordSuccess(
        response.message
      );

      /*
       * Backend revokes all refresh tokens after
       * a password change.
       */
      await authService
        .logout()
        .catch(() => undefined);

      router.replace(
        "/login?passwordChanged=true"
      );

      router.refresh();
    } catch (error) {
      setPasswordError(
        getApiErrorMessage(
          error,
          "Unable to change your password."
        )
      );

      setChangingPassword(false);
    }
  }

  /*
   * ============================================================
   * LOGOUT ALL
   * ============================================================
   */

  async function handleLogoutAll(): Promise<void> {
    if (loggingOutAll) {
      return;
    }

    const confirmed =
      window.confirm(
        "Log out all devices currently signed in to your Holy Matrimony account?"
      );

    if (!confirmed) {
      return;
    }

    setLoggingOutAll(true);
    setSecurityError(null);

    try {
      await accountService.logoutAll();

      await authService
        .logout()
        .catch(() => undefined);

      router.replace(
        "/login?loggedOutAll=true"
      );

      router.refresh();
    } catch (error) {
      setSecurityError(
        getApiErrorMessage(
          error,
          "Unable to log out all devices."
        )
      );

      setLoggingOutAll(false);
    }
  }

  /*
   * ============================================================
   * DEACTIVATE
   * ============================================================
   */

  async function handleDeactivateAccount(): Promise<void> {
    if (deactivating) {
      return;
    }

    setDeactivationError(null);

    if (
      !deactivationPassword.trim()
    ) {
      setDeactivationError(
        "Enter your password to deactivate your account."
      );

      return;
    }

    const confirmed =
      window.confirm(
        "Deactivate your Holy Matrimony account? You will be signed out immediately, but you can reactivate it later."
      );

    if (!confirmed) {
      return;
    }

    setDeactivating(true);

    try {
      await accountService.deactivateAccount({
        password:
          deactivationPassword,

        reason: deactivationReason.trim(),
      });

      await authService
        .logout()
        .catch(() => undefined);

      router.replace(
        "/login?accountDeactivated=true"
      );

      router.refresh();
    } catch (error) {
      setDeactivationError(
        getApiErrorMessage(
          error,
          "Unable to deactivate your account."
        )
      );

      setDeactivating(false);
    }
  }

  /*
   * ============================================================
   * PERMANENT DELETE
   * ============================================================
   */

  async function handleDeleteAccount(): Promise<void> {
    if (deletingAccount) {
      return;
    }

    setDeleteError(null);

    if (
      !deletePassword.trim()
    ) {
      setDeleteError(
        "Enter your password to permanently delete your account."
      );

      return;
    }

    if (
      deleteConfirmation.trim() !==
      "DELETE"
    ) {
      setDeleteError(
        'Type "DELETE" exactly to confirm permanent account deletion.'
      );

      return;
    }

    const confirmed =
      window.confirm(
        "This permanently deletes your Holy Matrimony account and cannot be undone. Continue?"
      );

    if (!confirmed) {
      return;
    }

    setDeletingAccount(true);

    try {
      await accountService.deleteAccount({
        password:
          deletePassword,

        confirmation:
          deleteConfirmation.trim(),
      });

      await authService
        .logout()
        .catch(() => undefined);

      router.replace(
        "/login?accountDeleted=true"
      );

      router.refresh();
    } catch (error) {
      setDeleteError(
        getApiErrorMessage(
          error,
          "Unable to permanently delete your account."
        )
      );

      setDeletingAccount(false);
    }
  }

  /*
   * ============================================================
   * LOADING / ERROR
   * ============================================================
   */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={30}
            className="mx-auto animate-spin text-[#0B2D5C]"
          />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading account settings...
          </p>
        </div>
      </div>
    );
  }

  if (
    accountError &&
    !account
  ) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <StatusMessage
          type="error"
          message={
            accountError
          }
        />
      </div>
    );
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <div className="space-y-6 pb-10">
      {/* ======================================================
          HEADER
         ====================================================== */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-blue-50/50 to-amber-50/50 shadow-sm">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0B2D5C] text-[#F2D675] shadow-lg">
              <ShieldCheck size={30} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B2871B]">
                Account & Security
              </p>

              <h1 className="mt-2 text-2xl font-black tracking-tight text-[#0B2D5C] sm:text-3xl">
                Account Settings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Manage your account information,
                password, active sessions and account
                lifecycle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          ACCOUNT DETAILS
         ====================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <SectionHeader
          icon={
            <UserRound size={21} />
          }
          title="Account details"
          description="Keep your basic account information current."
        />

        <form
          onSubmit={
            handleAccountUpdate
          }
          className="mt-6 space-y-5"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field>
              <FieldLabel>
                Full name
              </FieldLabel>

              <InputShell
                icon={
                  <UserRound
                    size={18}
                  />
                }
              >
                <input
                  type="text"
                  value={fullName}
                  onChange={(
                    event
                  ) =>
                    setFullName(
                      event.target
                        .value
                    )
                  }
                  maxLength={120}
                  autoComplete="name"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </InputShell>
            </Field>

            <Field>
              <FieldLabel>
                Mobile number
              </FieldLabel>

              <InputShell
                icon={
                  <Smartphone
                    size={18}
                  />
                }
              >
                <input
                  type="tel"
                  value={mobile}
                  onChange={(
                    event
                  ) =>
                    setMobile(
                      event.target
                        .value
                    )
                  }
                  maxLength={20}
                  autoComplete="tel"
                  placeholder="Mobile number"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </InputShell>
            </Field>
          </div>

          <Field>
            <FieldLabel>
              Email address
            </FieldLabel>

            <InputShell
              icon={
                <Mail size={18} />
              }
              muted
            >
              <input
                type="email"
                value={
                  account?.email ??
                  ""
                }
                disabled
                className="w-full bg-transparent text-sm text-slate-500 outline-none"
              />
            </InputShell>

            <p className="mt-2 text-xs text-slate-400">
              Your login email cannot currently be
              changed from this page.
            </p>
          </Field>

          {accountSuccess && (
            <StatusMessage
              type="success"
              message={
                accountSuccess
              }
            />
          )}

          {updateError && (
            <StatusMessage
              type="error"
              message={
                updateError
              }
            />
          )}

          <button
            type="submit"
            disabled={
              savingAccount
            }
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B2D5C] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#143D70] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingAccount ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Save size={18} />
            )}

            {savingAccount
              ? "Saving..."
              : "Save changes"}
          </button>
        </form>
      </section>

      {/* ======================================================
          PASSWORD
         ====================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <SectionHeader
          icon={
            <KeyRound size={21} />
          }
          title="Password"
          description="Use a strong password that you do not use on other websites."
        />

        <form
          onSubmit={
            handlePasswordChange
          }
          className="mt-6 space-y-5"
        >
          <PasswordField
            label="Current password"
            value={
              currentPassword
            }
            onChange={
              setCurrentPassword
            }
          />

          <div className="grid gap-5 md:grid-cols-2">
            <PasswordField
              label="New password"
              value={
                newPassword
              }
              onChange={
                setNewPassword
              }
            />

            <PasswordField
              label="Confirm new password"
              value={
                confirmPassword
              }
              onChange={
                setConfirmPassword
              }
            />
          </div>

          {passwordSuccess && (
            <StatusMessage
              type="success"
              message={
                passwordSuccess
              }
            />
          )}

          {passwordError && (
            <StatusMessage
              type="error"
              message={
                passwordError
              }
            />
          )}

          <button
            type="submit"
            disabled={
              changingPassword
            }
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B2D5C] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#143D70] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {changingPassword ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <KeyRound
                size={18}
              />
            )}

            {changingPassword
              ? "Changing password..."
              : "Change password"}
          </button>
        </form>
      </section>

      {/* ======================================================
          ACTIVE SESSIONS
         ====================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <SectionHeader
          icon={
            <ShieldCheck
              size={21}
            />
          }
          title="Login security"
          description="Sign out every browser or device currently using your account."
        />

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-[#0B2D5C]">
                Log out all devices
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                All existing login sessions will
                require authentication again.
              </p>
            </div>

            <button
              type="button"
              disabled={
                loggingOutAll
              }
              onClick={() => {
                void handleLogoutAll();
              }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-[#0B2D5C] shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOutAll ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <LogOut size={18} />
              )}

              {loggingOutAll
                ? "Logging out..."
                : "Log out all"}
            </button>
          </div>
        </div>

        {securityError && (
          <div className="mt-4">
            <StatusMessage
              type="error"
              message={
                securityError
              }
            />
          </div>
        )}
      </section>

      {/* ======================================================
          DANGER ZONE
         ====================================================== */}

      <section className="rounded-3xl border border-red-200 bg-white p-5 shadow-sm sm:p-7">
        <SectionHeader
          danger
          icon={
            <ShieldAlert
              size={21}
            />
          }
          title="Danger zone"
          description="These actions affect access to your Holy Matrimony account."
        />

        {/* ====================================================
            DEACTIVATE
           ==================================================== */}

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/70 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <ShieldAlert
                size={20}
              />
            </div>

            <div>
              <h3 className="font-bold text-red-950">
                Deactivate account
              </h3>

              <p className="mt-1 text-sm leading-6 text-red-700">
                Temporarily disable your account.
                You can reactivate it later using
                your email address and password.
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-red-700">
            You will immediately lose access and
            all active login sessions will be
            revoked.
          </p>

          <div className="mt-5 grid gap-4">
            <div>
              <FieldLabel>
                Password confirmation
              </FieldLabel>

              <input
                type="password"
                value={
                  deactivationPassword
                }
                onChange={(
                  event
                ) =>
                  setDeactivationPassword(
                    event.target
                      .value
                  )
                }
                autoComplete="current-password"
                placeholder="Enter your password"
                className="h-12 w-full rounded-xl border border-red-200 bg-white px-4 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
              />
            </div>

            <div>
              <FieldLabel>
                Reason{" "}
                <span className="font-normal text-slate-400">
                  (optional)
                </span>
              </FieldLabel>

              <textarea
                value={
                  deactivationReason
                }
                onChange={(
                  event
                ) =>
                  setDeactivationReason(
                    event.target
                      .value
                  )
                }
                maxLength={500}
                rows={3}
                placeholder="Tell us why you're leaving..."
                className="w-full resize-none rounded-xl border border-red-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
              />
            </div>
          </div>

          {deactivationError && (
            <div className="mt-4">
              <StatusMessage
                type="error"
                message={
                  deactivationError
                }
              />
            </div>
          )}

          <button
            type="button"
            disabled={
              deactivating
            }
            onClick={() => {
              void handleDeactivateAccount();
            }}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deactivating ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <ShieldAlert
                size={18}
              />
            )}

            {deactivating
              ? "Deactivating..."
              : "Deactivate my account"}
          </button>

          <div className="mt-4 text-sm text-slate-500">
            Already deactivated?{" "}
            <Link
              href="/reactivate-account"
              className="font-bold text-blue-700 hover:underline"
            >
              Reactivate your account
            </Link>
          </div>
        </div>

        {/* ====================================================
            PERMANENT DELETE
           ==================================================== */}

        <div className="mt-6 rounded-2xl border-2 border-red-300 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-200 text-red-800">
              <Trash2 size={20} />
            </div>

            <div>
              <h3 className="font-black text-red-950">
                Permanently delete account
              </h3>

              <p className="mt-1 text-sm leading-6 text-red-800">
                This permanently removes your
                personal profile information and
                profile photos. This action cannot
                be undone.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-red-200 bg-white p-4">
            <p className="text-sm font-black text-red-900">
              Before continuing:
            </p>

            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-red-700">
              <li>
                Your profile will no longer be
                accessible.
              </li>

              <li>
                Profile photos will be permanently
                removed.
              </li>

              <li>
                Personal profile information will
                be erased.
              </li>

              <li>
                All active sessions will be
                revoked.
              </li>

              <li>
                This account cannot be
                reactivated.
              </li>
            </ul>
          </div>

          <div className="mt-5 grid gap-4">
            <div>
              <FieldLabel>
                Password
              </FieldLabel>

              <input
                type="password"
                value={
                  deletePassword
                }
                onChange={(
                  event
                ) =>
                  setDeletePassword(
                    event.target
                      .value
                  )
                }
                autoComplete="current-password"
                placeholder="Enter your password"
                className="h-12 w-full rounded-xl border border-red-300 bg-white px-4 text-sm outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-100"
              />
            </div>

            <div>
              <FieldLabel>
                Type DELETE to confirm
              </FieldLabel>

              <input
                type="text"
                value={
                  deleteConfirmation
                }
                onChange={(
                  event
                ) =>
                  setDeleteConfirmation(
                    event.target
                      .value
                  )
                }
                autoComplete="off"
                placeholder="DELETE"
                className="h-12 w-full rounded-xl border border-red-300 bg-white px-4 font-mono text-sm font-bold tracking-wider outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-100"
              />
            </div>
          </div>

          {deleteError && (
            <div className="mt-4">
              <StatusMessage
                type="error"
                message={
                  deleteError
                }
              />
            </div>
          )}

          <button
            type="button"
            disabled={
              deletingAccount ||
              deleteConfirmation !==
                "DELETE" ||
              !deletePassword
            }
            onClick={() => {
              void handleDeleteAccount();
            }}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-800 px-5 py-3 text-sm font-black text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deletingAccount ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={18} />
            )}

            {deletingAccount
              ? "Deleting account..."
              : "Permanently delete account"}
          </button>
        </div>
      </section>
    </div>
  );
}

/*
 * ============================================================
 * SECTION HEADER
 * ============================================================
 */

function SectionHeader({
  icon,
  title,
  description,
  danger = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",

          danger
            ? "bg-red-100 text-red-700"
            : "bg-blue-50 text-[#0B2D5C]",
        ].join(" ")}
      >
        {icon}
      </div>

      <div>
        <h2
          className={[
            "text-lg font-black",

            danger
              ? "text-red-950"
              : "text-[#0B2D5C]",
          ].join(" ")}
        >
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/*
 * ============================================================
 * FIELD
 * ============================================================
 */

function Field({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
}

function FieldLabel({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <label className="mb-2 block text-sm font-bold text-slate-700">
      {children}
    </label>
  );
}

/*
 * ============================================================
 * INPUT SHELL
 * ============================================================
 */

function InputShell({
  icon,
  children,
  muted = false,
}: {
  icon: React.ReactNode;
  children:
    React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div
      className={[
        "flex h-12 items-center gap-3 rounded-xl border px-4 transition",

        muted
          ? "border-slate-200 bg-slate-100"
          : "border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100",
      ].join(" ")}
    >
      <span className="shrink-0 text-slate-400">
        {icon}
      </span>

      {children}
    </div>
  );
}

/*
 * ============================================================
 * PASSWORD FIELD
 * ============================================================
 */

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange:
    (value: string) => void;
}) {
  return (
    <div>
      <FieldLabel>
        {label}
      </FieldLabel>

      <InputShell
        icon={
          <KeyRound size={18} />
        }
      >
        <input
          type="password"
          value={value}
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
          autoComplete="current-password"
          className="w-full bg-transparent text-sm outline-none"
        />
      </InputShell>
    </div>
  );
}

/*
 * ============================================================
 * STATUS MESSAGE
 * ============================================================
 */

function StatusMessage({
  type,
  message,
}: {
  type:
    | "success"
    | "error";
  message: string;
}) {
  const success =
    type === "success";

  return (
    <div
      className={[
        "flex items-start gap-3 rounded-xl border p-4 text-sm font-medium",

        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700",
      ].join(" ")}
    >
      {success ? (
        <CheckCircle2
          size={18}
          className="mt-0.5 shrink-0"
        />
      ) : (
        <AlertCircle
          size={18}
          className="mt-0.5 shrink-0"
        />
      )}

      <p>{message}</p>
    </div>
  );
}