"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";

import AuthCard from "./AuthCard";

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);

    // TODO: Connect Forgot Password API
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setLoading(false);
    setSent(true);
  }

  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Enter your email to receive a password reset link."
    >
      {sent ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <Mail
            size={42}
            className="mx-auto mb-4 text-green-600"
          />

          <h3 className="text-lg font-bold text-green-700">
            Reset Link Sent
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Please check your email and follow the instructions.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-block font-semibold text-[#0B2D5C]"
          >
            Back to Login
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Email Address
            </label>

            <input
              required
              type="email"
              placeholder="Enter your registered email"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0B2D5C] focus:ring-2 focus:ring-[#0B2D5C]/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-[#0B2D5C] py-3 font-semibold text-white transition hover:bg-[#123C73] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="mr-2 animate-spin"
                />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>

          <p className="text-center text-sm">
            <Link
              href="/login"
              className="font-semibold text-[#D4AF37]"
            >
              Back to Login
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
}