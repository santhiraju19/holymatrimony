"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import AuthCard from "./AuthCard";
import useAuth from "@/features/auth/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/api";

export default function LoginForm() {
  const searchParams = useSearchParams();

  const { login, loading } = useAuth();

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    try {
      const requestedRedirect =
        searchParams.get("redirect");

      const redirectTo =
        requestedRedirect &&
        requestedRedirect.startsWith("/")
          ? requestedRedirect
          : "/dashboard";

      await login(
        {
          email: email.trim(),
          password,
        },
        redirectTo
      );
    } catch (error: unknown) {
      setError(
        getApiErrorMessage(
          error,
          "Login failed. Please check your email and password."
        )
      );
    }
  }

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to continue your Holy Matrimony journey."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="login-email"
            className="text-sm font-semibold text-slate-700"
          >
            Email address
          </label>

          <input
            id="login-email"
            required
            autoComplete="email"
            type="email"
            placeholder="Email Address"
            value={email}
            disabled={loading}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-[#0B2D5C] focus:ring-4 focus:ring-[#0B2D5C]/10 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="login-password"
            className="text-sm font-semibold text-slate-700"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="login-password"
              required
              autoComplete="current-password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              value={password}
              disabled={loading}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-slate-900 outline-none transition focus:border-[#0B2D5C] focus:ring-4 focus:ring-[#0B2D5C]/10 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            <button
              type="button"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              disabled={loading}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-[#0B2D5C] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() =>
                setShowPassword(
                  (current) => !current
                )
              }
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            !email.trim() ||
            !password
          }
          className="flex w-full items-center justify-center rounded-xl bg-[#0B2D5C] py-3 font-semibold text-white transition hover:bg-[#123C73] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2
                size={18}
                className="mr-2 animate-spin"
              />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </button>

        <div className="text-center">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-[#0B2D5C] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#D4AF37] hover:underline"
        >
          Create Account
        </Link>
      </p>
    </AuthCard>
  );
}