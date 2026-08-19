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
            size={17}
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
    <div className="space-y-3 pb-6">
      {/* ======================================================
          HEADER
         ====================================================== */}

      <section className="relative overflow-hidden rounded-[20px] border border-blue-900/10 bg-gradient-to-r from-[#071B36] via-[#0B2D5C] to-[#174A87] text-white shadow-[0_12px_32px_rgba(11,45,92,0.14)]">
        <div className="relative px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#F2D675]">
              <ShieldCheck size={17} />
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#F2D675]">
                Account & Security
              </p>

              <h1 className="mt-0.5 text-lg font-black tracking-[-0.025em] text-white sm:text-xl">
                Account Settings
              </h1>

              <p className="mt-0.5 max-w-2xl text-[10px] leading-5 text-blue-100 sm:text-[11px]">
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

      <section className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_26px_rgba(15,23,42,0.05)] sm:p-5">
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
          className="mt-4 space-y-4"
        >
          <div className="grid gap-3.5 md:grid-cols-2">
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
                  className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400 sm:text-[13px]"
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
                  className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400 sm:text-[13px]"
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
                className="w-full bg-transparent text-xs text-slate-500 outline-none sm:text-[13px]"
              />
            </InputShell>

            <p className="mt-1.5 text-[9px] leading-4 text-slate-400">
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
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0B2D5C] to-blue-700 px-3.5 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
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

      <section className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_26px_rgba(15,23,42,0.05)] sm:p-5">
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
          className="mt-4 space-y-4"
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

          <div className="grid gap-3.5 md:grid-cols-2">
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
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0B2D5C] to-blue-700 px-3.5 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
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

      <section className="rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_26px_rgba(15,23,42,0.05)] sm:p-5">
        <SectionHeader
          icon={
            <ShieldCheck
              size={21}
            />
          }
          title="Login security"
          description="Sign out every browser or device currently using your account."
        />

        <div className="mt-4 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-white to-slate-50 p-3.5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black text-[#0B2D5C]">
                Log out all devices
              </p>

              <p className="mt-1 text-[10px] leading-5 text-slate-500">
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
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3.5 text-xs font-black text-[#0B2D5C] shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
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
          <div className="mt-3">
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

      <section className="rounded-[18px] border border-red-200 bg-white p-4 shadow-[0_8px_26px_rgba(15,23,42,0.05)] sm:p-5">
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

        <div className="mt-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50/80 via-white to-orange-50/50 p-3.5">
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <ShieldAlert
                size={20}
              />
            </div>

            <div>
              <h3 className="text-xs font-black text-amber-950">
                Deactivate account
              </h3>

              <p className="mt-1 text-[10px] leading-5 text-amber-800">
                Temporarily disable your account.
                You can reactivate it later using
                your email address and password.
              </p>
            </div>
          </div>

          <p className="mt-3 text-[10px] leading-5 text-amber-800">
            You will immediately lose access and
            all active login sessions will be
            revoked.
          </p>

          <div className="mt-3 grid gap-3">
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
                className="h-10 w-full rounded-xl border border-amber-200 bg-white px-3.5 text-xs outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-50"
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
                className="w-full resize-none rounded-xl border border-amber-200 bg-white px-3.5 py-2.5 text-xs leading-5 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-50"
              />
            </div>
          </div>

          {deactivationError && (
            <div className="mt-3">
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
            className="mt-3 inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-3.5 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
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

          <div className="mt-3 text-[10px] text-slate-500">
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

        <div className="mt-3 rounded-xl border border-red-200 bg-gradient-to-r from-red-50/80 via-white to-rose-50/60 p-3.5">
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
              <Trash2 size={20} />
            </div>

            <div>
              <h3 className="text-xs font-black text-red-950">
                Permanently delete account
              </h3>

              <p className="mt-1 text-[10px] leading-5 text-red-700">
                This permanently removes your
                personal profile information and
                profile photos. This action cannot
                be undone.
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-red-100 bg-white/90 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.08em] text-red-900">
              Before continuing:
            </p>

            <ul className="mt-2 grid gap-1 pl-4 text-[10px] leading-5 text-red-700 sm:grid-cols-2">
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

          <div className="mt-3 grid gap-3">
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
                className="h-10 w-full rounded-xl border border-red-200 bg-white px-3.5 text-xs outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-50"
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
                className="h-10 w-full rounded-xl border border-red-200 bg-white px-3.5 font-mono text-xs font-black tracking-[0.12em] outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-50"
              />
            </div>
          </div>

          {deleteError && (
            <div className="mt-3">
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
            className="mt-3 inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-red-700 to-rose-700 px-3.5 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className="flex items-start gap-2.5">
      <div
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",

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
            "text-sm font-black tracking-[-0.01em]",

            danger
              ? "text-red-950"
              : "text-[#0B2D5C]",
          ].join(" ")}
        >
          {title}
        </h2>

        <p className="mt-0.5 text-[10px] leading-5 text-slate-500">
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
    <label className="mb-1.5 block text-[10px] font-black text-slate-600 sm:text-[11px]">
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
        "flex h-10 items-center gap-2.5 rounded-xl border px-3.5 transition",

        muted
          ? "border-slate-200 bg-slate-100/80"
          : "border-slate-200 bg-slate-50/60 focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50",
      ].join(" ")}
    >
      <span className="shrink-0 text-slate-400 [&>svg]:h-4 [&>svg]:w-4">
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
          className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400 sm:text-[13px]"
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
        "flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[10px] font-semibold",

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