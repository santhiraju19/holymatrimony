"use client";

import {
  BadgeCheck,
  CheckCircle2,
  Church,
  Clock3,
  Fingerprint,
  Loader2,
  MailCheck,
  ShieldCheck,
  Smartphone,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import verificationService from "@/features/verification/api/verification.service";

import type {
  TrustVerificationResponse,
  VerificationItem,
  VerificationStatus,
  VerificationType,
} from "@/features/verification/types";

import {
  getApiErrorMessage,
} from "@/lib/api";

export default function TrustVerificationCenter() {
  const [
    data,
    setData,
  ] = useState<TrustVerificationResponse | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const [
    submittingType,
    setSubmittingType,
  ] = useState<VerificationType | null>(
    null
  );

  const [
    notes,
    setNotes,
  ] = useState<
    Partial<Record<VerificationType, string>>
  >({});

  useEffect(() => {
    void load();
  }, []);

  async function load(): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const response =
        await verificationService
          .getVerificationCenter();

      setData(response);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Unable to load trust and verification status."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  async function submit(
    type: VerificationType
  ): Promise<void> {
    if (submittingType) {
      return;
    }

    setSubmittingType(type);
    setError(null);

    try {
      const response =
        await verificationService
          .submitVerification(
            type,
            notes[type]
          );

      setData(response);

      setNotes((current) => ({
        ...current,
        [type]: "",
      }));
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Unable to submit verification request."
        )
      );
    } finally {
      setSubmittingType(null);
    }
  }

  const verificationMap =
    useMemo(() => {
      const map =
        new Map<
          VerificationType,
          VerificationItem
        >();

      data?.verifications.forEach(
        (item) => {
          map.set(
            item.type,
            item
          );
        }
      );

      return map;
    }, [data]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2
            className="mx-auto animate-spin text-[#0B2D5C]"
            size={30}
          />

          <p className="mt-3 text-sm font-semibold text-slate-500">
            Loading verification center...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
        {error ??
          "Unable to load verification center."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-[#0B2D5C] via-[#123F78] to-[#1F4E8C] p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-[#F2D675]">
              <ShieldCheck size={18} />
              Trust & Verification
            </div>

            <h1 className="mt-3 text-3xl font-black">
              Build trust in your profile
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
              Complete verification checks to help
              other members feel more confident
              connecting with you.
            </p>
          </div>

          <div className="min-w-[190px] rounded-3xl bg-white/10 p-5 text-center backdrop-blur">
            <div className="text-4xl font-black text-[#F2D675]">
              {data.trustScore}%
            </div>

            <div className="mt-1 text-sm font-bold">
              Trust Score
            </div>

            <div className="mt-2 text-xs text-blue-100">
              {data.completedChecks} of{" "}
              {data.totalChecks} checks complete
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <VerificationCard
          icon={<MailCheck size={23} />}
          title="Email Verification"
          description="Confirms that you control your registered email address."
          status={
            data.emailVerified
              ? "APPROVED"
              : "NOT_SUBMITTED"
          }
          readOnly
        />

        <VerificationCard
          icon={<Smartphone size={23} />}
          title="Mobile Verification"
          description="Verify your mobile number using a secure OTP."
          status={
            verificationMap.get("MOBILE")
              ?.status ??
            "NOT_SUBMITTED"
          }
          comingSoon
        />

        <VerificationCard
          icon={<Church size={23} />}
          title="Church Verification"
          description="Submit your church information for Holy Matrimony review."
          status={
            verificationMap.get("CHURCH")
              ?.status ??
            "NOT_SUBMITTED"
          }
          item={
            verificationMap.get("CHURCH")
          }
          note={
            notes.CHURCH ?? ""
          }
          onNoteChange={(value) =>
            setNotes((current) => ({
              ...current,
              CHURCH: value,
            }))
          }
          submitting={
            submittingType === "CHURCH"
          }
          onSubmit={() =>
            void submit("CHURCH")
          }
        />

        <VerificationCard
          icon={<Fingerprint size={23} />}
          title="Identity Verification"
          description="Submit an identity verification request. Secure document upload will be added next."
          status={
            verificationMap.get("IDENTITY")
              ?.status ??
            "NOT_SUBMITTED"
          }
          item={
            verificationMap.get("IDENTITY")
          }
          note={
            notes.IDENTITY ?? ""
          }
          onNoteChange={(value) =>
            setNotes((current) => ({
              ...current,
              IDENTITY: value,
            }))
          }
          submitting={
            submittingType === "IDENTITY"
          }
          onSubmit={() =>
            void submit("IDENTITY")
          }
        />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <BadgeCheck
            size={22}
            className="text-[#0B2D5C]"
          />

          <div>
            <h2 className="font-black text-[#0B2D5C]">
              Overall Profile Verification
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current status:{" "}
              <span className="font-bold">
                {formatStatus(
                  data.profileVerificationStatus
                )}
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

interface VerificationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: VerificationStatus;
  item?: VerificationItem;
  note?: string;
  onNoteChange?: (value: string) => void;
  submitting?: boolean;
  onSubmit?: () => void;
  readOnly?: boolean;
  comingSoon?: boolean;
}

function VerificationCard({
  icon,
  title,
  description,
  status,
  item,
  note = "",
  onNoteChange,
  submitting = false,
  onSubmit,
  readOnly = false,
  comingSoon = false,
}: VerificationCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#0B2D5C]">
          {icon}
        </div>

        <StatusBadge status={status} />
      </div>

      <h3 className="mt-4 text-lg font-black text-[#0B2D5C]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>

      {comingSoon && (
        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500">
          Coming soon — OTP verification
        </div>
      )}

      {status === "REJECTED" &&
        item?.reviewReason && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-red-500">
              Review feedback
            </p>

            <p className="mt-2 text-sm text-red-700">
              {item.reviewReason}
            </p>
          </div>
        )}

      {!readOnly &&
        !comingSoon &&
        status !== "APPROVED" &&
        status !== "PENDING" && (
          <>
            <textarea
              value={note}
              onChange={(event) =>
                onNoteChange?.(
                  event.target.value
                )
              }
              maxLength={1000}
              rows={3}
              placeholder="Optional note for the verification team"
              className="mt-4 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            <button
              type="button"
              disabled={submitting}
              onClick={onSubmit}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#123F78] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <ShieldCheck size={17} />
              )}

              {status === "REJECTED"
                ? "Resubmit verification"
                : "Submit verification"}
            </button>
          </>
        )}

      {status === "PENDING" && (
        <p className="mt-4 text-xs font-bold text-amber-700">
          Verification request is under review.
        </p>
      )}

      {status === "APPROVED" && (
        <p className="mt-4 text-xs font-bold text-emerald-700">
          Verification approved.
        </p>
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: VerificationStatus;
}) {
  const config = {
    NOT_SUBMITTED: {
      label: "Not verified",
      className:
        "bg-slate-100 text-slate-600",
      icon: null,
    },

    PENDING: {
      label: "Pending",
      className:
        "bg-amber-100 text-amber-700",
      icon: <Clock3 size={13} />,
    },

    APPROVED: {
      label: "Verified",
      className:
        "bg-emerald-100 text-emerald-700",
      icon: <CheckCircle2 size={13} />,
    },

    REJECTED: {
      label: "Needs attention",
      className:
        "bg-red-100 text-red-700",
      icon: <XCircle size={13} />,
    },
  }[status];

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${config.className}`}
    >
      {config.icon}
      {config.label}
    </div>
  );
}

function formatStatus(
  value: string
): string {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1)
    )
    .join(" ");
}