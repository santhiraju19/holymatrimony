"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import AuthCard from "./AuthCard";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);

    // Sprint 5.2
    // Replace with auth API
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setLoading(false);
  };

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to continue your journey."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Email Address
          </label>

          <input
            required
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0B2D5C] focus:ring-2 focus:ring-[#0B2D5C]/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Password
          </label>

          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none transition focus:border-[#0B2D5C] focus:ring-2 focus:ring-[#0B2D5C]/20"
            />

            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input
              checked={remember}
              type="checkbox"
              onChange={(e) => setRemember(e.target.checked)}
            />

            Remember me
          </label>

          <Link
            href="/forgot-password"
            className="font-semibold text-[#0B2D5C] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="flex w-full items-center justify-center rounded-xl bg-[#0B2D5C] py-3 font-semibold text-white transition hover:bg-[#123C73] disabled:cursor-not-allowed disabled:opacity-70"
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
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-bold text-[#D4AF37] hover:underline"
        >
          Create Account
        </Link>
      </p>
    </AuthCard>
  );
}