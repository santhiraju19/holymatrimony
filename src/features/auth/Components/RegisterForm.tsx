"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import AuthCard from "./AuthCard";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);

    // TODO: Connect API
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setLoading(false);
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
        <input
          required
          placeholder="Full Name"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-[#0B2D5C] focus:ring-2 focus:ring-[#0B2D5C]/20 outline-none"
        />

        <input
          required
          type="email"
          placeholder="Email Address"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-[#0B2D5C] focus:ring-2 focus:ring-[#0B2D5C]/20 outline-none"
        />

        <input
          required
          placeholder="Mobile Number"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-[#0B2D5C] focus:ring-2 focus:ring-[#0B2D5C]/20 outline-none"
        />

        <div className="relative">
          <input
            required
            type={showPassword ? "text" : "password"}
            placeholder="Create Password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 focus:border-[#0B2D5C] focus:ring-2 focus:ring-[#0B2D5C]/20 outline-none"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="flex w-full items-center justify-center rounded-xl bg-[#0B2D5C] py-3 font-semibold text-white hover:bg-[#123C73] disabled:opacity-60"
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

      <p className="mt-8 text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#D4AF37]"
        >
          Sign In
        </Link>
      </p>
    </AuthCard>
  );
}