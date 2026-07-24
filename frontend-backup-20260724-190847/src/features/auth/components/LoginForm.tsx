"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import AuthCard from "./AuthCard";
import { authService } from "../services/auth.service";
import { getToken } from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      console.log("========== LOGIN START ==========");

      const result = await authService.login({
        email,
        password,
      });

      console.log("Login Response:", result);

      const token = getToken();

      console.log("Stored Token:", token);

      if (!token) {
        throw new Error("JWT Token was not stored.");
      }

      console.log("Redirecting to profile...");

      router.replace("/profile");
    } catch (err: any) {
      console.error("LOGIN ERROR:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Login failed.");
      }
    } finally {
      setLoading(false);
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
          <div className="rounded-lg border border-red-300 bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <input
          required
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0B2D5C] focus:ring-2 focus:ring-[#0B2D5C]/20"
        />

        <div className="relative">
          <input
            required
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none focus:border-[#0B2D5C] focus:ring-2 focus:ring-[#0B2D5C]/20"
          />

          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-xl bg-[#0B2D5C] py-3 font-semibold text-white hover:bg-[#123C73] disabled:opacity-60"
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
            className="text-sm text-[#0B2D5C] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
      </form>

      <p className="mt-8 text-center text-sm">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#D4AF37]"
        >
          Create Account
        </Link>
      </p>
    </AuthCard>
  );
}