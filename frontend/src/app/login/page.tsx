"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#0B2D5C]">
            Holy Matrimony
          </h1>

          <p className="mt-2 text-gray-500">
            Welcome back! Sign in to continue.
          </p>
        </div>

        <form className="mt-8 space-y-5">

          <div>
            <label className="mb-2 block font-medium">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#0B2D5C]"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Password
            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-[#0B2D5C]"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

            </div>
          </div>

          <div className="flex items-center justify-between">

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" />
              Remember me
            </label>

            <Link
              href="/forgot-password"
              className="text-sm text-[#0B2D5C]"
            >
              Forgot Password?
            </Link>

          </div>

          <button
            className="w-full rounded-xl bg-[#0B2D5C] py-3 font-semibold text-white transition hover:bg-[#123C73]"
          >
            Login
          </button>

        </form>

        <p className="mt-8 text-center text-sm">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#D4AF37]"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}