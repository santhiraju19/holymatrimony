"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { authService } from "@/features/auth/services/auth.service";

type Step =
  | "email"
  | "otp"
  | "password"
  | "success";

function getErrorMessage(
  error: unknown
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const axiosError = error as {
      response?: {
        data?: {
          message?: string;
          error?: string;
        };
      };
    };

    return (
      axiosError.response?.data?.message ??
      axiosError.response?.data?.error ??
      "Something went wrong. Please try again."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export default function ForgotPasswordForm() {
  const router = useRouter();

  const [step, setStep] =
    useState<Step>("email");

  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [resetToken, setResetToken] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const stepNumber = useMemo(() => {
    if (step === "email") return 1;
    if (step === "otp") return 2;
    if (step === "password") return 3;
    return 3;
  }, [step]);

  function clearFeedback(): void {
    setError("");
    setMessage("");
  }

  async function handleRequestOtp(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    clearFeedback();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Please enter your registered email address."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await authService
          .requestPasswordResetOtp({
            email: normalizedEmail,
          });

      setEmail(normalizedEmail);

      setMessage(
        response.message ??
          "If an account exists with that email, a password reset OTP has been sent."
      );

      setStep("otp");
    } catch (requestError) {
      setError(
        getErrorMessage(requestError)
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    clearFeedback();

    const normalizedOtp =
      otp.trim();

    if (!/^\d{6}$/.test(normalizedOtp)) {
      setError(
        "Enter the 6-digit OTP sent to your email."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await authService
          .verifyPasswordResetOtp({
            email,
            otp: normalizedOtp,
          });

      if (!response.resetToken) {
        throw new Error(
          "A password reset token was not returned."
        );
      }

      setResetToken(
        response.resetToken
      );

      setMessage(
        response.message ??
          "OTP verified. Create your new password."
      );

      setStep("password");
    } catch (verificationError) {
      setError(
        getErrorMessage(
          verificationError
        )
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    clearFeedback();

    if (newPassword.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "New password and confirm password do not match."
      );
      return;
    }

    if (!resetToken) {
      setError(
        "Your password reset session is missing. Please start again."
      );
      setStep("email");
      return;
    }

    try {
      setLoading(true);

      const response =
        await authService.resetPassword({
          resetToken,
          newPassword,
          confirmPassword,
        });

      setMessage(
        response.message ??
          "Password reset successful."
      );

      setStep("success");
    } catch (resetError) {
      setError(
        getErrorMessage(resetError)
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp():
  Promise<void> {
    clearFeedback();

    try {
      setLoading(true);

      const response =
        await authService
          .requestPasswordResetOtp({
            email,
          });

      setOtp("");

      setMessage(
        response.message ??
          "A new password reset OTP has been sent."
      );
    } catch (resendError) {
      setError(
        getErrorMessage(resendError)
      );
    } finally {
      setLoading(false);
    }
  }

  if (step === "success") {
    return (
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50">
          <CheckCircle2
            size={32}
            className="text-emerald-600"
          />
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
            Password Updated
          </p>

          <h1 className="mt-3 text-3xl font-bold text-[#0B2D5C]">
            Your password has been reset
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            {message}
          </p>
        </div>

        <Button
          className="mt-8 w-full"
          onClick={() =>
            router.push("/login")
          }
        >
          Continue to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#0B2D5C]"
      >
        <ArrowLeft size={17} />
        Back to login
      </Link>

      <div className="mt-7">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
          Account Recovery
        </p>

        <h1 className="mt-3 text-3xl font-bold text-[#0B2D5C]">
          Forgot your password?
        </h1>

        <p className="mt-3 leading-7 text-slate-600">
          Verify your registered email and create a
          secure new password.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-3 gap-2">
        {[
          {
            number: 1,
            label: "Email",
          },
          {
            number: 2,
            label: "OTP",
          },
          {
            number: 3,
            label: "Password",
          },
        ].map((item) => {
          const active =
            item.number <= stepNumber;

          return (
            <div
              key={item.number}
              className="text-center"
            >
              <div
                className={[
                  "h-1.5 rounded-full transition",
                  active
                    ? "bg-[#0B2D5C]"
                    : "bg-slate-200",
                ].join(" ")}
              />

              <p
                className={[
                  "mt-2 text-xs font-semibold",
                  active
                    ? "text-[#0B2D5C]"
                    : "text-slate-400",
                ].join(" ")}
              >
                {item.label}
              </p>
            </div>
          );
        })}
      </div>

      {message && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium leading-6 text-red-700"
        >
          {error}
        </div>
      )}

      {step === "email" && (
        <form
          className="mt-8 space-y-6"
          onSubmit={(event) => {
            void handleRequestOtp(
              event
            );
          }}
        >
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Mail
                size={20}
                className="mt-0.5 shrink-0 text-[#0B2D5C]"
              />

              <p className="text-sm leading-6 text-slate-600">
                Enter the email address used to create
                your Holy Matrimony account.
              </p>
            </div>
          </div>

          <Input
            label="Registered Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => {
              setEmail(
                event.target.value
              );
              clearFeedback();
            }}
            required
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Sending OTP...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={18} />
                Send Password Reset OTP
              </span>
            )}
          </Button>
        </form>
      )}

      {step === "otp" && (
        <form
          className="mt-8 space-y-6"
          onSubmit={(event) => {
            void handleVerifyOtp(
              event
            );
          }}
        >
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <KeyRound
                size={20}
                className="mt-0.5 shrink-0 text-amber-700"
              />

              <p className="text-sm leading-6 text-amber-800">
                Enter the 6-digit OTP sent to{" "}
                <strong>{email}</strong>.
              </p>
            </div>
          </div>

          <Input
            label="Password Reset OTP"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={otp}
            maxLength={6}
            onChange={(event) => {
              const digits =
                event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6);

              setOtp(digits);
              clearFeedback();
            }}
            required
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Verifying...
              </span>
            ) : (
              "Verify OTP"
            )}
          </Button>

          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                void handleResendOtp();
              }}
              className="text-sm font-semibold text-[#0B2D5C] hover:underline disabled:opacity-50"
            >
              Resend OTP
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                clearFeedback();
                setOtp("");
                setStep("email");
              }}
              className="text-sm font-semibold text-slate-500 hover:text-[#0B2D5C] disabled:opacity-50"
            >
              Change email
            </button>
          </div>
        </form>
      )}

      {step === "password" && (
        <form
          className="mt-8 space-y-6"
          onSubmit={(event) => {
            void handleResetPassword(
              event
            );
          }}
        >
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <LockKeyhole
                size={20}
                className="mt-0.5 shrink-0 text-emerald-700"
              />

              <p className="text-sm leading-6 text-emerald-800">
                OTP verified. Create a new password
                containing at least 8 characters.
              </p>
            </div>
          </div>

          <Input
            label="New Password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter a secure password"
            value={newPassword}
            onChange={(event) => {
              setNewPassword(
                event.target.value
              );
              clearFeedback();
            }}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(
                event.target.value
              );
              clearFeedback();
            }}
            required
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Resetting Password...
              </span>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
