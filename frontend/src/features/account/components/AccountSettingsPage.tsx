"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  LockKeyhole,
  LogOut,
  Mail,
  MonitorSmartphone,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import accountService from "@/features/account/api/account.service";

import {
  Account,
  ChangePasswordRequest,
} from "@/features/account/types";

import { useAuthContext } from "@/features/auth/context/AuthContext";

import { getApiErrorMessage } from "@/lib/api";

interface AccountForm {
  fullName: string;
  mobile: string;
}

const EMPTY_PASSWORD_FORM: ChangePasswordRequest = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function AccountSettingsPage() {
  const router = useRouter();

  const {
    user,
    updateUser,
    logout,
  } = useAuthContext();

  const [account, setAccount] =
    useState<Account | null>(null);

  const [form, setForm] =
    useState<AccountForm>({
      fullName: "",
      mobile: "",
    });

  const [passwordForm, setPasswordForm] =
    useState<ChangePasswordRequest>(
      EMPTY_PASSWORD_FORM
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  const [
    loggingOutAll,
    setLoggingOutAll,
  ] = useState(false);

  const [accountError, setAccountError] =
    useState<string | null>(null);

  const [accountSuccess, setAccountSuccess] =
    useState<string | null>(null);

  const [passwordError, setPasswordError] =
    useState<string | null>(null);

  const [passwordSuccess, setPasswordSuccess] =
    useState<string | null>(null);

  const [securityError, setSecurityError] =
    useState<string | null>(null);

  async function loadAccount(): Promise<void> {
    setLoading(true);
    setAccountError(null);

    try {
      const data =
        await accountService.getAccount();

      setAccount(data);

      setForm({
        fullName: data.fullName ?? "",
        mobile: data.mobile ?? "",
      });
    } catch (error) {
      setAccountError(
        getApiErrorMessage(
          error,
          "Unable to load your account."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAccount();
  }, []);

  async function handleAccountSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    if (saving) {
      return;
    }

    setSaving(true);
    setAccountError(null);
    setAccountSuccess(null);

    try {
      const updated =
        await accountService.updateAccount({
          fullName: form.fullName.trim(),
          mobile: form.mobile.trim(),
        });

      setAccount(updated);

      setForm({
        fullName: updated.fullName ?? "",
        mobile: updated.mobile ?? "",
      });

      /*
       * Keep the globally stored authentication
       * user synchronized so navigation/header
       * components can use the updated name.
       */
      updateUser({
        ...(user ?? {
          email: updated.email,
        }),
        id: updated.id,
        fullName: updated.fullName,
        email: updated.email,
      });

      setAccountSuccess(
        "Account details updated successfully."
      );
    } catch (error) {
      setAccountError(
        getApiErrorMessage(
          error,
          "Unable to update your account."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    if (changingPassword) {
      return;
    }

    setPasswordError(null);
    setPasswordSuccess(null);

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordError(
        "New password and confirmation do not match."
      );

      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError(
        "New password must contain at least 8 characters."
      );

      return;
    }

    setChangingPassword(true);

    try {
      const response =
        await accountService.changePassword(
          passwordForm
        );

      setPasswordForm(
        EMPTY_PASSWORD_FORM
      );

      setPasswordSuccess(
        response.message ||
          "Password changed successfully."
      );

      /*
       * The backend revokes every refresh token
       * after a password change.
       *
       * Remove the current access token locally
       * as well and require a clean sign-in.
       */
      window.setTimeout(() => {
        logout();

        router.replace(
          "/login?passwordChanged=true"
        );

        router.refresh();
      }, 1200);
    } catch (error) {
      setPasswordError(
        getApiErrorMessage(
          error,
          "Unable to change your password."
        )
      );
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleLogoutAll(): Promise<void> {
    if (loggingOutAll) {
      return;
    }

    const confirmed = window.confirm(
      "Log out from all devices? You will need to sign in again on this device too."
    );

    if (!confirmed) {
      return;
    }

    setLoggingOutAll(true);
    setSecurityError(null);

    try {
      await accountService.logoutAll();

      /*
       * Refresh sessions are now revoked on
       * the backend. Remove this browser's
       * access token as well.
       */
      logout();

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

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="text-center">
          <Loader2
            size={32}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading account settings...
          </p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle
            size={22}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div>
            <h2 className="font-bold text-red-900">
              Unable to load account
            </h2>

            <p className="mt-1 text-sm text-red-700">
              {accountError ??
                "Your account information could not be loaded."}
            </p>

            <button
              type="button"
              onClick={() => {
                void loadAccount();
              }}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#071B36] via-[#0B2D5C] to-[#174B87] p-6 text-white shadow-xl md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#F2D675]">
              <ShieldCheck size={15} />
              Account & Security
            </div>

            <h1 className="text-2xl font-black tracking-tight md:text-3xl">
              Account Settings
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              Manage your account information,
              password and active sessions securely.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.08] px-5 py-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              Account status
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

              <span className="font-bold">
                {account.status}
              </span>
            </div>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleAccountSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"
      >
        <SectionHeader
          icon={<UserRound size={20} />}
          title="Personal account details"
          description="Update the basic information associated with your Holy Matrimony account."
        />

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <Field
            label="Full name"
            icon={<UserRound size={18} />}
          >
            <input
              type="text"
              required
              minLength={2}
              maxLength={120}
              value={form.fullName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  fullName:
                    event.target.value,
                }))
              }
              className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
              placeholder="Your full name"
            />
          </Field>

          <Field
            label="Mobile number"
            icon={<Phone size={18} />}
          >
            <input
              type="tel"
              value={form.mobile}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  mobile:
                    event.target.value,
                }))
              }
              className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
              placeholder="+91XXXXXXXXXX"
            />
          </Field>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Email address
            </label>

            <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
              <Mail
                size={18}
                className="shrink-0 text-slate-400"
              />

              <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-600">
                {account.email}
              </span>

              {account.emailVerified && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 size={13} />
                  Verified
                </span>
              )}
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Email changes require a separate
              verification process and are currently
              protected from direct editing.
            </p>
          </div>
        </div>

        {accountError && (
          <StatusMessage
            type="error"
            message={accountError}
          />
        )}

        {accountSuccess && (
          <StatusMessage
            type="success"
            message={accountSuccess}
          />
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-w-40 items-center justify-center gap-2 rounded-2xl bg-[#0B2D5C] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#123C73] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Save size={18} />
            )}

            {saving
              ? "Saving..."
              : "Save changes"}
          </button>
        </div>
      </form>

      <form
        onSubmit={handlePasswordSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"
      >
        <SectionHeader
          icon={<KeyRound size={20} />}
          title="Change password"
          description="Use your current password to securely create a new password."
        />

        <div className="mt-7 grid gap-5">
          <PasswordField
            label="Current password"
            value={
              passwordForm.currentPassword
            }
            onChange={(value) =>
              setPasswordForm(
                (current) => ({
                  ...current,
                  currentPassword: value,
                })
              )
            }
          />

          <div className="grid gap-5 md:grid-cols-2">
            <PasswordField
              label="New password"
              value={
                passwordForm.newPassword
              }
              onChange={(value) =>
                setPasswordForm(
                  (current) => ({
                    ...current,
                    newPassword: value,
                  })
                )
              }
            />

            <PasswordField
              label="Confirm new password"
              value={
                passwordForm.confirmPassword
              }
              onChange={(value) =>
                setPasswordForm(
                  (current) => ({
                    ...current,
                    confirmPassword: value,
                  })
                )
              }
            />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
          Changing your password will securely
          revoke existing login sessions. You will
          be asked to sign in again.
        </div>

        {passwordError && (
          <StatusMessage
            type="error"
            message={passwordError}
          />
        )}

        {passwordSuccess && (
          <StatusMessage
            type="success"
            message={passwordSuccess}
          />
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={changingPassword}
            className="inline-flex min-w-44 items-center justify-center gap-2 rounded-2xl bg-[#0B2D5C] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#123C73] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {changingPassword ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <KeyRound size={18} />
            )}

            {changingPassword
              ? "Updating..."
              : "Change password"}
          </button>
        </div>
      </form>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <SectionHeader
          icon={
            <MonitorSmartphone size={20} />
          }
          title="Login security"
          description="Protect your account if you signed in on another computer, phone or shared device."
        />

        <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0B2D5C] shadow-sm">
              <LockKeyhole size={20} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Log out from all devices
              </h3>

              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                Revokes all active refresh sessions,
                including this browser. Use this if
                you believe another device may still
                have access to your account.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loggingOutAll}
            onClick={() => {
              void handleLogoutAll();
            }}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
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

        {securityError && (
          <StatusMessage
            type="error"
            message={securityError}
          />
        )}
      </section>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        {icon}
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
        <span className="shrink-0 text-slate-400">
          {icon}
        </span>

        {children}
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
        <LockKeyhole
          size={18}
          className="shrink-0 text-slate-400"
        />

        <input
          type="password"
          required
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          autoComplete={
            label === "Current password"
              ? "current-password"
              : "new-password"
          }
          className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
        />
      </div>
    </div>
  );
}

function StatusMessage({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  const success =
    type === "success";

  return (
    <div
      className={[
        "mt-5 flex items-start gap-3 rounded-2xl border p-4 text-sm font-medium",
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
