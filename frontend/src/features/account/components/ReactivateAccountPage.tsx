"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

import accountService from "@/features/account/api/account.service";
import { getApiErrorMessage } from "@/lib/api";

export default function ReactivateAccountPage() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response =
        await accountService.reactivateAccount({
          email: email.trim(),
          password,
        });

      setSuccess(response.message);
      setPassword("");
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "Unable to reactivate your account."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-8">
      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.10)] sm:p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B2D5C] to-blue-700 text-[#F2D675] shadow-lg">
            <ShieldCheck size={20} />
          </div>

          <h1 className="mt-4 text-xl font-black tracking-[-0.025em] text-[#0B2D5C]">
            Reactivate your account
          </h1>

          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            Enter the email address and password
            associated with your deactivated Holy
            Matrimony account.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-5 space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-[11px] font-black text-slate-600">
                Email address
              </label>

              <div className="flex h-10 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
                <Mail
                  size={18}
                  className="text-slate-400 [&]:h-4 [&]:w-4"
                />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400 sm:text-[13px]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-black text-slate-600">
                Password
              </label>

              <div className="flex h-10 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
                <KeyRound
                  size={18}
                  className="text-slate-400 [&]:h-4 [&]:w-4"
                />

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  autoComplete="current-password"
                  className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400 sm:text-[13px]"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] font-semibold text-red-700">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[10px] font-semibold text-emerald-700">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p>{success}</p>

                  <Link
                    href="/login"
                    className="mt-1.5 inline-flex font-black text-emerald-800 underline underline-offset-2"
                  >
                    Sign in now
                  </Link>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={
                submitting ||
                Boolean(success)
              }
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0B2D5C] to-blue-700 text-xs font-black text-white shadow-[0_8px_22px_rgba(11,45,92,0.20)] transition hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              )}

              {submitting
                ? "Reactivating..."
                : success
                  ? "Account reactivated"
                  : "Reactivate account"}
            </button>
          </form>

          {!success && (
            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="text-[11px] font-black text-blue-700 hover:underline"
              >
                Return to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}