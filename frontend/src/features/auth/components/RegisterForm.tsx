"use client";

import {
  useState,
  type FormEvent,
} from "react";

import Link from "next/link";

import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import AuthCard from "./AuthCard";

import {
  authService,
} from "../services/auth.service";

function normalizeMobile(
  value: string
): string {
  return value.replace(
    /[\s()-]/g,
    ""
  );
}

function getErrorMessage(
  error: unknown
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const responseError =
      error as {
        response?: {
          data?: {
            message?: string;
            error?: string;
          };
        };
      };

    return (
      responseError.response?.data
        ?.message ??
      responseError.response?.data
        ?.error ??
      "Unable to register. Please try again."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to register. Please try again.";
}

export default function RegisterForm() {
  const router =
    useRouter();

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    fullName,
    setFullName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    mobile,
    setMobile,
  ] = useState("+91");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedName =
      fullName.trim();

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const normalizedMobile =
      normalizeMobile(mobile);

    if (!normalizedName) {
      setError(
        "Full name is required."
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail
      )
    ) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (
      !/^\+[1-9]\d{7,14}$/.test(
        normalizedMobile
      )
    ) {
      setError(
        "Enter a valid mobile number with country code, for example +919876543210."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await authService.register({
          fullName:
            normalizedName,
          email:
            normalizedEmail,
          mobile:
            normalizedMobile,
          password,
        });

      setSuccess(
        response.message ??
          "Registration successful."
      );

      window.setTimeout(() => {
  router.push(
    `/verify-email?email=${encodeURIComponent(
      normalizedEmail
    )}`
  );
}, 1000);
    } catch (requestError) {
      console.error(
        "Registration failed:",
        requestError
      );

      setError(
        getErrorMessage(
          requestError
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create Your Account"
      subtitle="Begin your Holy Matrimony journey."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {success && (
          <div
            role="status"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
          >
            {success}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="register-full-name"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Full Name
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <div className="relative">
            <UserRound
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="register-full-name"
              required
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(event) =>
                setFullName(
                  event.target.value
                )
              }
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-[#0B2D5C] focus:ring-2 focus:ring-[#0B2D5C]/20"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Email Address
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="register-email"
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="name@example.com"
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-[#0B2D5C] focus:ring-2 focus:ring-[#0B2D5C]/20"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="register-mobile"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Mobile Number
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <div className="relative">
            <Phone
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="register-mobile"
              required
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={mobile}
              onChange={(event) =>
                setMobile(
                  event.target.value
                )
              }
              placeholder="+91 98765 43210"
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-[#0B2D5C] focus:ring-2 focus:ring-[#0B2D5C]/20"
            />
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Include the country code. For
            India, use +91 followed by the
            ten-digit mobile number.
          </p>
        </div>

        <div>
          <label
            htmlFor="register-password"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Create Password
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <div className="relative">
            <ShieldCheck
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="register-password"
              required
              minLength={8}
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              autoComplete="new-password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Minimum 8 characters"
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-12 outline-none transition focus:border-[#0B2D5C] focus:ring-2 focus:ring-[#0B2D5C]/20"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (current) =>
                    !current
                )
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-[#0B2D5C]"
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
          disabled={loading}
          className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#0B2D5C] px-5 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#123C73] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2
                size={18}
                className="mr-2 animate-spin"
              />

              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#B38B19] hover:underline"
        >
          Sign In
        </Link>
      </p>
    </AuthCard>
  );
}