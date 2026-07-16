"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import AuthCard from "./AuthCard";
import { authService } from "./services/auth.service";

export default function RegisterForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await authService.register({
        fullName,
        email,
        mobile,
        password,
      });

      setSuccess(response.message);

      setTimeout(() => {
        router.push("/login");
      }, 1500);

    } catch (err: any) {

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Unable to register. Please try again.");
      }

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
          <div className="rounded-lg bg-green-100 border border-green-300 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-100 border border-red-300 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-[#0B2D5C] focus:ring-2 focus:ring-[#0B2D5C]/20 outline-none"
        />

        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-[#0B2D5C] focus:ring-2 focus:ring-[#0B2D5C]/20 outline-none"
        />

        <input
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="Mobile Number"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-[#0B2D5C] focus:ring-2 focus:ring-[#0B2D5C]/20 outline-none"
        />

        <div className="relative">
          <input
            required
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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