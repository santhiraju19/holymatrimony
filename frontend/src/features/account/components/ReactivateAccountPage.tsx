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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0B2D5C]">
            <ShieldCheck size={26} />
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-900">
            Reactivate your account
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter the email address and password
            associated with your deactivated Holy
            Matrimony account.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Email address
              </label>

              <div className="flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                <Mail
                  size={18}
                  className="text-slate-400"
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
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Password
              </label>

              <div className="flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                <KeyRound
                  size={18}
                  className="text-slate-400"
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
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p>{success}</p>

                  <Link
                    href="/login"
                    className="mt-2 inline-block font-bold text-emerald-800 underline"
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
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0B2D5C] font-bold text-white transition hover:bg-[#123C73] disabled:cursor-not-allowed disabled:opacity-60"
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
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm font-bold text-blue-700 hover:underline"
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