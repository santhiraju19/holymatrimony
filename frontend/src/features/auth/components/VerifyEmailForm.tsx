"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import Link from "next/link";

import {
  CheckCircle2,
  Loader2,
  MailCheck,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import AuthCard from "./AuthCard";
import OtpInput from "./OtpInput";

import authService from "../services/auth.service";

const RESEND_SECONDS = 60;

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
      "Unable to complete email verification."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to complete email verification.";
}

function maskEmail(
  email: string
): string {
  const [
    localPart,
    domain,
  ] = email.split("@");

  if (
    !localPart ||
    !domain
  ) {
    return email;
  }

  if (localPart.length <= 2) {
    return `${localPart[0] ?? ""}***@${domain}`;
  }

  return `${localPart.slice(
    0,
    2
  )}***@${domain}`;
}

export default function VerifyEmailForm() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const email =
    useMemo(
      () =>
        searchParams
          .get("email")
          ?.trim()
          .toLowerCase() ?? "",
      [searchParams]
    );

  const [
    otp,
    setOtp,
  ] = useState("");

  const [
    secondsRemaining,
    setSecondsRemaining,
  ] = useState(
    RESEND_SECONDS
  );

  const [
    verifying,
    setVerifying,
  ] = useState(false);

  const [
    resending,
    setResending,
  ] = useState(false);

  const [
    checkingStatus,
    setCheckingStatus,
  ] = useState(true);

  const [
    verified,
    setVerified,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  useEffect(() => {
    if (
      secondsRemaining <= 0 ||
      verified
    ) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setSecondsRemaining(
          (current) =>
            Math.max(
              current - 1,
              0
            )
        );
      }, 1000);

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    secondsRemaining,
    verified,
  ]);

  useEffect(() => {
    if (!email) {
      setCheckingStatus(false);
      return;
    }

    let active = true;

    async function loadStatus(): Promise<void> {
      try {
        const response =
          await authService
            .getEmailVerificationStatus(
              email
            );

        if (!active) {
          return;
        }

        if (
          response.emailVerified
        ) {
          setVerified(true);
          setMessage(
            response.message ??
              "Your email is already verified."
          );
        }
      } catch (statusError) {
        console.error(
          "Unable to load verification status:",
          statusError
        );
      } finally {
        if (active) {
          setCheckingStatus(false);
        }
      }
    }

    void loadStatus();

    return () => {
      active = false;
    };
  }, [email]);

  useEffect(() => {
    if (!verified) {
      return;
    }

    const redirectTimer =
      window.setTimeout(() => {
        router.replace(
          `/login?verified=true&email=${encodeURIComponent(
            email
          )}`
        );
      }, 1800);

    return () => {
      window.clearTimeout(
        redirectTimer
      );
    };
  }, [
    verified,
    router,
    email,
  ]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      setError(
        "Email address is missing. Please register again."
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError(
        "Enter the complete 6-digit OTP."
      );
      return;
    }

    setVerifying(true);

    try {
      const response =
        await authService
          .verifyEmailOtp({
            email,
            otp,
          });

      if (
        response.emailVerified
      ) {
        setVerified(true);
        setMessage(
          response.message ??
            "Email verified successfully."
        );
        return;
      }

      setMessage(
        response.message ??
          "Verification request completed."
      );
    } catch (verificationError) {
      console.error(
        "Email verification failed:",
        verificationError
      );

      setError(
        getErrorMessage(
          verificationError
        )
      );

      setOtp("");
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend(): Promise<void> {
    if (
      !email ||
      secondsRemaining > 0 ||
      resending
    ) {
      return;
    }

    setError("");
    setMessage("");
    setResending(true);

    try {
      const response =
        await authService
          .resendEmailOtp({
            email,
          });

      if (
        response.emailVerified
      ) {
        setVerified(true);
        setMessage(
          response.message ??
            "Your email is already verified."
        );
        return;
      }

      setMessage(
        response.message ??
          "A new OTP has been sent."
      );

      setOtp("");
      setSecondsRemaining(
        RESEND_SECONDS
      );
    } catch (resendError) {
      console.error(
        "OTP resend failed:",
        resendError
      );

      setError(
        getErrorMessage(
          resendError
        )
      );
    } finally {
      setResending(false);
    }
  }

  if (checkingStatus) {
    return (
      <AuthCard
        title="Checking Verification"
        subtitle="Please wait while we check your email status."
      >
        <div className="flex min-h-56 flex-col items-center justify-center text-center">
          <Loader2
            size={34}
            className="animate-spin text-[#0B2D5C]"
          />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading verification status...
          </p>
        </div>
      </AuthCard>
    );
  }

  if (!email) {
    return (
      <AuthCard
        title="Email Required"
        subtitle="We could not identify the email address to verify."
      >
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
          <p className="text-sm leading-6 text-amber-800">
            Please create your account again so
            we can send you a verification code.
          </p>
        </div>

        <Link
          href="/register"
          className="mt-5 flex min-h-12 items-center justify-center rounded-2xl bg-[#0B2D5C] px-5 text-sm font-black text-white"
        >
          Return to Registration
        </Link>
      </AuthCard>
    );
  }

  if (verified) {
    return (
      <AuthCard
        title="Email Verified"
        subtitle="Your Holy Matrimony account is ready."
      >
        <div className="flex flex-col items-center py-5 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2
              size={42}
            />
          </div>

          <h2 className="mt-5 text-xl font-black text-[#0B2D5C]">
            Verification Successful
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            {message ||
              "Your email address has been verified successfully."}
          </p>

          <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Loader2
              size={17}
              className="animate-spin"
            />

            Redirecting to sign in...
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Verify Your Email"
      subtitle="Enter the six-digit code sent to your email address."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="rounded-[24px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-amber-50 p-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B2D5C] text-[#F2D675] shadow-md">
            <MailCheck
              size={26}
            />
          </div>

          <p className="mt-4 text-sm text-slate-600">
            We sent a verification code to
          </p>

          <p className="mt-1 break-all font-black text-[#0B2D5C]">
            {maskEmail(email)}
          </p>
        </div>

        {message && (
          <div
            role="status"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
          >
            {message}
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
          <label className="mb-3 block text-center text-sm font-black text-[#0B2D5C]">
            Email Verification Code
          </label>

          <OtpInput
            value={otp}
            onChange={(value) => {
              setOtp(value);
              setError("");
            }}
            disabled={verifying}
            hasError={Boolean(error)}
          />
        </div>

        <button
          type="submit"
          disabled={
            verifying ||
            otp.length !== 6
          }
          className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#0B2D5C] px-5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#123C73] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {verifying ? (
            <>
              <Loader2
                size={18}
                className="mr-2 animate-spin"
              />

              Verifying Email...
            </>
          ) : (
            <>
              <ShieldCheck
                size={18}
                className="mr-2"
              />

              Verify Email
            </>
          )}
        </button>

        <div className="text-center">
          {secondsRemaining > 0 ? (
            <p className="text-sm text-slate-500">
              Resend available in{" "}
              <span className="font-black text-[#0B2D5C]">
                00:
                {String(
                  secondsRemaining
                ).padStart(2, "0")}
              </span>
            </p>
          ) : (
            <button
              type="button"
              disabled={resending}
              onClick={() => {
                void handleResend();
              }}
              className="inline-flex items-center gap-2 text-sm font-black text-[#B38B19] transition hover:text-[#0B2D5C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resending ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <RefreshCcw
                  size={16}
                />
              )}

              {resending
                ? "Sending New OTP..."
                : "Resend Email OTP"}
            </button>
          )}
        </div>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        Entered the wrong email?{" "}
        <Link
          href="/register"
          className="font-black text-[#B38B19] hover:underline"
        >
          Register Again
        </Link>
      </p>
    </AuthCard>
  );
}