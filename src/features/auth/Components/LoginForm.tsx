"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import AuthCard from "./AuthCard";
import { login } from "./services/auth.service";

export default function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await login({
        email,
        password,
      });

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("email", response.email);
      localStorage.setItem("fullName", response.fullName);

      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to continue your journey."
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Email Address
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0B2D5C] focus:ring-2 focus:ring-[#0B2D5C]/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Password
          </label>

          <div className="relative">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none transition focus:border-[#0B2D5C] focus:ring-2 focus:ring-[#0B2D5C]/20"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
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
            <input type="checkbox" />
            Remember me
          </label>

          <Link
            href="/forgot-password"
            className="font-medium text-[#0B2D5C] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#0B2D5C] py-3 font-semibold text-white transition hover:bg-[#123C73] disabled:opacity-60"
        >
          {loading ? "Signing In..." : "Login"}
        </button>

      </form>

      <p className="mt-8 text-center text-sm">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#D4AF37] hover:underline"
        >
          Register
        </Link>
      </p>
    </AuthCard>
  );
}
