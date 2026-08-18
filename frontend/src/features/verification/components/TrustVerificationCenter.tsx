"use client";

import {
  BadgeCheck,
  CheckCircle2,
  Church,
  Clock3,
  FileText,
  Fingerprint,
  Loader2,
  MailCheck,
  RefreshCw,
  Send,
  ShieldCheck,
  Smartphone,
  Upload,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import verificationService from "@/features/verification/api/verification.service";
import ChurchVerificationCard from "@/features/verification/components/ChurchVerificationCard";

import type {
  ChurchVerificationMethod,
  IdentityDocumentType,
  TrustVerificationResponse,
  VerificationItem,
  VerificationStatus,
  VerificationType,
} from "@/features/verification/types";

import {
  getApiErrorMessage,
} from "@/lib/api";

const MAX_IDENTITY_FILE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_IDENTITY_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "application/pdf",
  ]);


  const MAX_CHURCH_FILE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_CHURCH_FILE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "application/pdf",
  ]);

export default function TrustVerificationCenter() {

  const [
    data,
    setData,
  ] =
    useState<TrustVerificationResponse | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    submittingType,
    setSubmittingType,
  ] =
    useState<VerificationType | null>(
      null
    );

  const [
    notes,
    setNotes,
  ] =
    useState<
      Partial<
        Record<
          VerificationType,
          string
        >
      >
    >({});

  const [
    mobileOtp,
    setMobileOtp,
  ] =
    useState("");

  const [
    mobileOtpSent,
    setMobileOtpSent,
  ] =
    useState(false);

  const [
    mobileNumber,
    setMobileNumber,
  ] =
    useState<string | null>(
      null
    );

  const [
    mobileMessage,
    setMobileMessage,
  ] =
    useState<string | null>(
      null
    );

  const [
    mobileError,
    setMobileError,
  ] =
    useState<string | null>(
      null
    );

  const [
    sendingMobileOtp,
    setSendingMobileOtp,
  ] =
    useState(false);

  const [
    verifyingMobileOtp,
    setVerifyingMobileOtp,
  ] =
    useState(false);

  const [
    resendingMobileOtp,
    setResendingMobileOtp,
  ] =
    useState(false);

  const [
    identityDocumentType,
    setIdentityDocumentType,
  ] =
    useState<IdentityDocumentType>(
      "AADHAAR"
    );

  const [
    identityFile,
    setIdentityFile,
  ] =
    useState<File | null>(
      null
    );

  const [
    identityNote,
    setIdentityNote,
  ] =
    useState("");

  const [
    identityUploading,
    setIdentityUploading,
  ] =
    useState(false);

  const [
    identityError,
    setIdentityError,
  ] =
    useState<string | null>(
      null
    );

  const [
    identityMessage,
    setIdentityMessage,
  ] =
    useState<string | null>(
      null
    );

  useEffect(() => {
    void load();
  }, []);

    const [
    churchMethod,
    setChurchMethod,
  ] =
    useState<ChurchVerificationMethod>(
      "DOCUMENT"
    );

  const [
    churchPastorName,
    setChurchPastorName,
  ] =
    useState("");

  const [
    churchPhone,
    setChurchPhone,
  ] =
    useState("");

  const [
    churchEmail,
    setChurchEmail,
  ] =
    useState("");

  const [
    churchMembershipId,
    setChurchMembershipId,
  ] =
    useState("");

  const [
    churchFile,
    setChurchFile,
  ] =
    useState<File | null>(
      null
    );

  const [
    churchNote,
    setChurchNote,
  ] =
    useState("");

  const [
    churchSubmitting,
    setChurchSubmitting,
  ] =
    useState(false);

  const [
    churchError,
    setChurchError,
  ] =
    useState<string | null>(
      null
    );

  const [
    churchMessage,
    setChurchMessage,
  ] =
    useState<string | null>(
      null
    );

  async function load(): Promise<void> {

    setLoading(true);
    setError(null);

    try {

      const response =
        await verificationService
          .getVerificationCenter();

      setData(
        response
      );

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

    if (
      submittingType
    ) {
      return;
    }

    setSubmittingType(
      type
    );

    setError(
      null
    );

    try {

      const response =
        await verificationService
          .submitVerification(
            type,
            notes[type]
          );

      setData(
        response
      );

      setNotes(
        (current) => ({
          ...current,
          [type]: "",
        })
      );

    } catch (err) {

      setError(
        getApiErrorMessage(
          err,
          "Unable to submit verification request."
        )
      );

    } finally {

      setSubmittingType(
        null
      );
    }
  }

  async function requestMobileOtp():
    Promise<void> {

    if (
      sendingMobileOtp
    ) {
      return;
    }

    setSendingMobileOtp(
      true
    );

    setMobileError(
      null
    );

    setMobileMessage(
      null
    );

    try {

      const response =
        await verificationService
          .requestMobileOtp();

      setMobileNumber(
        response.mobile
      );

      setMobileMessage(
        response.message
      );

      if (
        response.verified
      ) {

        setMobileOtpSent(
          false
        );

        setMobileOtp("");

        await refreshVerificationCenter();

        return;
      }

      setMobileOtpSent(
        true
      );

    } catch (err) {

      setMobileError(
        getApiErrorMessage(
          err,
          "Unable to send the mobile verification OTP."
        )
      );

    } finally {

      setSendingMobileOtp(
        false
      );
    }
  }

  async function resendMobileOtp():
    Promise<void> {

    if (
      resendingMobileOtp
    ) {
      return;
    }

    setResendingMobileOtp(
      true
    );

    setMobileError(
      null
    );

    setMobileMessage(
      null
    );

    try {

      const response =
        await verificationService
          .resendMobileOtp();

      setMobileNumber(
        response.mobile
      );

      setMobileMessage(
        response.message
      );

      setMobileOtp("");

      if (
        response.verified
      ) {

        setMobileOtpSent(
          false
        );

        await refreshVerificationCenter();

        return;
      }

      setMobileOtpSent(
        true
      );

    } catch (err) {

      setMobileError(
        getApiErrorMessage(
          err,
          "Unable to resend the mobile verification OTP."
        )
      );

    } finally {

      setResendingMobileOtp(
        false
      );
    }
  }

  async function verifyMobileOtp():
    Promise<void> {

    if (
      verifyingMobileOtp
    ) {
      return;
    }

    const normalizedOtp =
      mobileOtp.trim();

    if (
      !/^\d{6}$/.test(
        normalizedOtp
      )
    ) {

      setMobileError(
        "Enter the 6-digit OTP sent to your mobile."
      );

      return;
    }

    setVerifyingMobileOtp(
      true
    );

    setMobileError(
      null
    );

    setMobileMessage(
      null
    );

    try {

      const response =
        await verificationService
          .verifyMobileOtp({
            otp: normalizedOtp,
          });

      setMobileNumber(
        response.mobile
      );

      setMobileMessage(
        response.message
      );

      if (
        response.verified
      ) {

        setMobileOtp("");

        setMobileOtpSent(
          false
        );

        await refreshVerificationCenter();
      }

    } catch (err) {

      setMobileError(
        getApiErrorMessage(
          err,
          "Unable to verify the mobile OTP."
        )
      );

    } finally {

      setVerifyingMobileOtp(
        false
      );
    }
  }

  async function uploadIdentityDocument():
    Promise<void> {

    if (
      identityUploading
    ) {
      return;
    }

    setIdentityError(
      null
    );

    setIdentityMessage(
      null
    );

    if (
      !identityFile
    ) {

      setIdentityError(
        "Please choose an identity document."
      );

      return;
    }

    if (
      !ALLOWED_IDENTITY_TYPES
        .has(
          identityFile.type
        )
    ) {

      setIdentityError(
        "Only JPEG, PNG or PDF files are allowed."
      );

      return;
    }

    if (
      identityFile.size >
      MAX_IDENTITY_FILE_SIZE
    ) {

      setIdentityError(
        "Identity document must not exceed 5 MB."
      );

      return;
    }

    setIdentityUploading(
      true
    );

    try {

      await verificationService
        .uploadIdentityDocument({
          documentType:
            identityDocumentType,
          file:
            identityFile,
          note:
            identityNote.trim() ||
            undefined,
        });

      setIdentityMessage(
        "Identity document uploaded successfully and submitted for review."
      );

      setIdentityFile(
        null
      );

      setIdentityNote("");

      await refreshVerificationCenter();

    } catch (err) {

      setIdentityError(
        getApiErrorMessage(
          err,
          "Unable to upload identity document."
        )
      );

    } finally {

      setIdentityUploading(
        false
      );
    }
  }


  async function submitChurchVerification():
    Promise<void> {

    if (
      churchSubmitting
    ) {
      return;
    }

    setChurchError(
      null
    );

    setChurchMessage(
      null
    );

    /*
     * ============================================================
     * Document Verification
     * ============================================================
     */

    if (
      churchMethod ===
      "DOCUMENT"
    ) {

      if (
        !churchFile
      ) {

        setChurchError(
          "Please choose a church verification document."
        );

        return;
      }

      if (
        !ALLOWED_CHURCH_FILE_TYPES
          .has(
            churchFile.type
          )
      ) {

        setChurchError(
          "Only JPEG, PNG or PDF files are allowed."
        );

        return;
      }

      if (
        churchFile.size >
        MAX_CHURCH_FILE_SIZE
      ) {

        setChurchError(
          "Church verification document must not exceed 5 MB."
        );

        return;
      }
    }

    /*
     * ============================================================
     * Pastor / Church Contact
     * ============================================================
     */

    if (
      churchMethod ===
      "PASTOR_CONTACT"
    ) {

      const normalizedPhone =
        churchPhone.trim();

      const normalizedEmail =
        churchEmail.trim();

      if (
        !normalizedPhone &&
        !normalizedEmail
      ) {

        setChurchError(
          "Please provide a church phone number or church email."
        );

        return;
      }

      if (
        normalizedEmail &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
          .test(
            normalizedEmail
          )
      ) {

        setChurchError(
          "Please enter a valid church email address."
        );

        return;
      }
    }

    /*
     * ============================================================
     * Membership ID
     * ============================================================
     */

    if (
      churchMethod ===
      "MEMBERSHIP_ID" &&
      !churchMembershipId.trim()
    ) {

      setChurchError(
        "Please enter the membership ID or member number issued by your church."
      );

      return;
    }

    /*
     * A supporting document may optionally accompany
     * membership verification.
     */

    if (
      churchMethod ===
        "MEMBERSHIP_ID" &&
      churchFile
    ) {

      if (
        !ALLOWED_CHURCH_FILE_TYPES
          .has(
            churchFile.type
          )
      ) {

        setChurchError(
          "Only JPEG, PNG or PDF files are allowed."
        );

        return;
      }

      if (
        churchFile.size >
        MAX_CHURCH_FILE_SIZE
      ) {

        setChurchError(
          "Church verification document must not exceed 5 MB."
        );

        return;
      }
    }

    setChurchSubmitting(
      true
    );

    try {

      await verificationService
        .submitChurchVerification({
          verificationMethod:
            churchMethod,

          pastorName:
            churchMethod ===
              "PASTOR_CONTACT"
              ? churchPastorName.trim() ||
                undefined
              : undefined,

          churchPhone:
            churchMethod ===
              "PASTOR_CONTACT"
              ? churchPhone.trim() ||
                undefined
              : undefined,

          churchEmail:
            churchMethod ===
              "PASTOR_CONTACT"
              ? churchEmail.trim() ||
                undefined
              : undefined,

          membershipId:
            churchMethod ===
              "MEMBERSHIP_ID"
              ? churchMembershipId.trim()
              : undefined,

          file:
            churchMethod ===
              "DOCUMENT" ||
            churchMethod ===
              "MEMBERSHIP_ID"
              ? churchFile
              : null,

          note:
            churchNote.trim() ||
            undefined,
        });

      setChurchMessage(
        "Church verification submitted successfully and is now under review."
      );

      setChurchFile(
        null
      );

      setChurchNote("");

      await refreshVerificationCenter();

    } catch (err) {

      setChurchError(
        getApiErrorMessage(
          err,
          "Unable to submit church verification."
        )
      );

    } finally {

      setChurchSubmitting(
        false
      );
    }
  }

  async function refreshVerificationCenter():
    Promise<void> {

    const response =
      await verificationService
        .getVerificationCenter();

    setData(
      response
    );
  }

  const verificationMap =
    useMemo(
      () => {

        const map =
          new Map<
            VerificationType,
            VerificationItem
          >();

        data
          ?.verifications
          .forEach(
            (item) => {

              map.set(
                item.type,
                item
              );
            }
          );

        return map;

      },
      [data]
    );

  const mobileStatus =
    verificationMap
      .get("MOBILE")
      ?.status ??
    "NOT_SUBMITTED";

  const identityItem =
    verificationMap
      .get("IDENTITY");

  const identityStatus =
    identityItem
      ?.status ??
    "NOT_SUBMITTED";

      const churchItem =
    verificationMap
      .get("CHURCH");

  const churchStatus =
    churchItem
      ?.status ??
    "NOT_SUBMITTED";

  if (
    loading
  ) {

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

  if (
    !data
  ) {

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
              <ShieldCheck
                size={18}
              />

              Trust & Verification
            </div>

            <h1 className="mt-3 text-3xl font-black">
              Build trust in your profile
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
              Complete verification checks to help other members feel more confident connecting with you.
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
          icon={
            <MailCheck
              size={23}
            />
          }
          title="Email Verification"
          description="Confirms that you control your registered email address."
          status={
            data.emailVerified
              ? "APPROVED"
              : "NOT_SUBMITTED"
          }
          readOnly
        />

        <MobileVerificationCard
          status={
            mobileStatus
          }
          mobileNumber={
            mobileNumber
          }
          otp={
            mobileOtp
          }
          otpSent={
            mobileOtpSent
          }
          message={
            mobileMessage
          }
          error={
            mobileError
          }
          sending={
            sendingMobileOtp
          }
          verifying={
            verifyingMobileOtp
          }
          resending={
            resendingMobileOtp
          }
          onOtpChange={
            setMobileOtp
          }
          onSend={() =>
            void requestMobileOtp()
          }
          onVerify={() =>
            void verifyMobileOtp()
          }
          onResend={() =>
            void resendMobileOtp()
          }
        />

                <ChurchVerificationCard
          status={
            churchStatus
          }
          item={
            churchItem
          }
          method={
            churchMethod
          }
          pastorName={
            churchPastorName
          }
          churchPhone={
            churchPhone
          }
          churchEmail={
            churchEmail
          }
          membershipId={
            churchMembershipId
          }
          file={
            churchFile
          }
          note={
            churchNote
          }
          message={
            churchMessage
          }
          error={
            churchError
          }
          submitting={
            churchSubmitting
          }
          onMethodChange={
            (method) => {

              setChurchMethod(
                method
              );

              setChurchError(
                null
              );

              setChurchMessage(
                null
              );

              setChurchFile(
                null
              );
            }
          }
          onPastorNameChange={
            setChurchPastorName
          }
          onChurchPhoneChange={
            setChurchPhone
          }
          onChurchEmailChange={
            setChurchEmail
          }
          onMembershipIdChange={
            setChurchMembershipId
          }
          onFileChange={
            setChurchFile
          }
          onNoteChange={
            setChurchNote
          }
          onSubmit={() =>
            void submitChurchVerification()
          }
        />

        <IdentityVerificationCard
          status={
            identityStatus
          }
          item={
            identityItem
          }
          documentType={
            identityDocumentType
          }
          file={
            identityFile
          }
          note={
            identityNote
          }
          message={
            identityMessage
          }
          error={
            identityError
          }
          uploading={
            identityUploading
          }
          onDocumentTypeChange={
            setIdentityDocumentType
          }
          onFileChange={
            setIdentityFile
          }
          onNoteChange={
            setIdentityNote
          }
          onSubmit={() =>
            void uploadIdentityDocument()
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

interface IdentityVerificationCardProps {
  status: VerificationStatus;
  item?: VerificationItem;

  documentType:
    IdentityDocumentType;

  file:
    File | null;

  note:
    string;

  message:
    string | null;

  error:
    string | null;

  uploading:
    boolean;

  onDocumentTypeChange: (
    value: IdentityDocumentType
  ) => void;

  onFileChange: (
    value: File | null
  ) => void;

  onNoteChange: (
    value: string
  ) => void;

  onSubmit:
    () => void;
}

function IdentityVerificationCard({
  status,
  item,
  documentType,
  file,
  note,
  message,
  error,
  uploading,
  onDocumentTypeChange,
  onFileChange,
  onNoteChange,
  onSubmit,
}: IdentityVerificationCardProps) {

  const approved =
    status ===
    "APPROVED";

  const pending =
    status ===
    "PENDING";

  const rejected =
    status ===
    "REJECTED";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#0B2D5C]">
          <Fingerprint
            size={23}
          />
        </div>

        <StatusBadge
          status={
            status
          }
        />
      </div>

      <h3 className="mt-4 text-lg font-black text-[#0B2D5C]">
        Identity Verification
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Upload a government-issued identity document for secure manual verification.
      </p>

      {rejected &&
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

      {message && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {approved ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          <CheckCircle2
            size={18}
          />

          Identity verification approved.
        </div>
      ) : pending ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
          Your identity document is securely stored and is currently under review.
        </div>
      ) : (
        <>
          <div className="mt-5">
            <label className="text-sm font-bold text-slate-700">
              Document type
            </label>

            <select
              value={
                documentType
              }
              onChange={
                (event) =>
                  onDocumentTypeChange(
                    event.target
                      .value as IdentityDocumentType
                  )
              }
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="AADHAAR">
                Aadhaar
              </option>

              <option value="PASSPORT">
                Passport
              </option>

              <option value="DRIVING_LICENCE">
                Driving Licence
              </option>

              <option value="VOTER_ID">
                Voter ID
              </option>
            </select>
          </div>

          <div className="mt-4">
            <label className="text-sm font-bold text-slate-700">
              Identity document
            </label>

            <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center transition hover:border-blue-300 hover:bg-blue-50/40">
              <Upload
                size={24}
                className="text-[#0B2D5C]"
              />

              <span className="mt-2 text-sm font-bold text-slate-700">
                Choose JPEG, PNG or PDF
              </span>

              <span className="mt-1 text-xs text-slate-400">
                Maximum file size: 5 MB
              </span>

              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                className="hidden"
                onChange={
                  (event) => {

                    const selectedFile =
                      event.target.files?.[0] ??
                      null;

                    onFileChange(
                      selectedFile
                    );
                  }
                }
              />
            </label>

            {file && (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <FileText
                  size={18}
                  className="shrink-0 text-[#0B2D5C]"
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-700">
                    {file.name}
                  </p>

                  <p className="text-xs text-slate-400">
                    {formatFileSize(
                      file.size
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          <textarea
            value={
              note
            }
            onChange={
              (event) =>
                onNoteChange(
                  event.target.value
                )
            }
            maxLength={
              1000
            }
            rows={
              3
            }
            placeholder="Optional note for the verification team"
            className="mt-4 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

          <button
            type="button"
            disabled={
              uploading ||
              !file
            }
            onClick={
              onSubmit
            }
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#123F78] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <ShieldCheck
                size={17}
              />
            )}

            {uploading
              ? "Uploading securely..."
              : rejected
                ? "Resubmit identity document"
                : "Submit identity document"}
          </button>
        </>
      )}
    </div>
  );
}

interface MobileVerificationCardProps {

  status:
    VerificationStatus;

  mobileNumber:
    string | null;

  otp:
    string;

  otpSent:
    boolean;

  message:
    string | null;

  error:
    string | null;

  sending:
    boolean;

  verifying:
    boolean;

  resending:
    boolean;

  onOtpChange: (
    value: string
  ) => void;

  onSend:
    () => void;

  onVerify:
    () => void;

  onResend:
    () => void;
}

function MobileVerificationCard({
  status,
  mobileNumber,
  otp,
  otpSent,
  message,
  error,
  sending,
  verifying,
  resending,
  onOtpChange,
  onSend,
  onVerify,
  onResend,
}: MobileVerificationCardProps) {

  const approved =
    status ===
    "APPROVED";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#0B2D5C]">
          <Smartphone
            size={23}
          />
        </div>

        <StatusBadge
          status={
            status
          }
        />
      </div>

      <h3 className="mt-4 text-lg font-black text-[#0B2D5C]">
        Mobile Verification
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Verify your registered mobile number using a secure 6-digit OTP.
      </p>

      {mobileNumber && (
        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Registered mobile
          </p>

          <p className="mt-1 text-sm font-black text-slate-700">
            {mobileNumber}
          </p>
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {approved ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          <CheckCircle2
            size={18}
          />

          Mobile number verified successfully.
        </div>
      ) : !otpSent ? (
        <button
          type="button"
          disabled={
            sending
          }
          onClick={
            onSend
          }
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#123F78] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <Send
              size={17}
            />
          )}

          {sending
            ? "Sending OTP..."
            : "Send verification OTP"}
        </button>
      ) : (
        <div className="mt-5">
          <label className="text-sm font-bold text-slate-700">
            Enter verification OTP
          </label>

          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={
              otp
            }
            maxLength={
              6
            }
            onChange={
              (event) => {

                const value =
                  event.target
                    .value
                    .replace(
                      /\D/g,
                      ""
                    )
                    .slice(
                      0,
                      6
                    );

                onOtpChange(
                  value
                );
              }
            }
            placeholder="000000"
            className="mt-2 h-14 w-full rounded-xl border border-slate-200 px-4 text-center text-xl font-black tracking-[0.5em] text-[#0B2D5C] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

          <button
            type="button"
            disabled={
              verifying ||
              otp.length !==
                6
            }
            onClick={
              onVerify
            }
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#123F78] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {verifying ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <ShieldCheck
                size={17}
              />
            )}

            {verifying
              ? "Verifying..."
              : "Verify mobile"}
          </button>

          <button
            type="button"
            disabled={
              resending
            }
            onClick={
              onResend
            }
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-[#0B2D5C] hover:text-[#0B2D5C] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resending ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <RefreshCw
                size={16}
              />
            )}

            {resending
              ? "Sending new OTP..."
              : "Resend OTP"}
          </button>

          <p className="mt-3 text-center text-xs text-slate-400">
            OTP expires in 10 minutes.
          </p>
        </div>
      )}
    </div>
  );
}

interface VerificationCardProps {

  icon:
    React.ReactNode;

  title:
    string;

  description:
    string;

  status:
    VerificationStatus;

  item?:
    VerificationItem;

  note?:
    string;

  onNoteChange?: (
    value: string
  ) => void;

  submitting?:
    boolean;

  onSubmit?:
    () => void;

  readOnly?:
    boolean;
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
}: VerificationCardProps) {

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#0B2D5C]">
          {icon}
        </div>

        <StatusBadge
          status={
            status
          }
        />
      </div>

      <h3 className="mt-4 text-lg font-black text-[#0B2D5C]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>

      {status ===
        "REJECTED" &&
        item
          ?.reviewReason && (
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
        status !==
          "APPROVED" &&
        status !==
          "PENDING" && (
          <>
            <textarea
              value={
                note
              }
              onChange={
                (event) =>
                  onNoteChange?.(
                    event.target
                      .value
                  )
              }
              maxLength={
                1000
              }
              rows={
                3
              }
              placeholder="Optional note for the verification team"
              className="mt-4 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            <button
              type="button"
              disabled={
                submitting
              }
              onClick={
                onSubmit
              }
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#123F78] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <ShieldCheck
                  size={17}
                />
              )}

              {status ===
              "REJECTED"
                ? "Resubmit verification"
                : "Submit verification"}
            </button>
          </>
        )}

      {status ===
        "PENDING" && (
        <p className="mt-4 text-xs font-bold text-amber-700">
          Verification request is under review.
        </p>
      )}

      {status ===
        "APPROVED" && (
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
  status:
    VerificationStatus;
}) {

  const config =
    {
      NOT_SUBMITTED: {
        label:
          "Not verified",
        className:
          "bg-slate-100 text-slate-600",
        icon:
          null,
      },

      PENDING: {
        label:
          "Pending",
        className:
          "bg-amber-100 text-amber-700",
        icon:
          <Clock3
            size={13}
          />,
      },

      APPROVED: {
        label:
          "Verified",
        className:
          "bg-emerald-100 text-emerald-700",
        icon:
          <CheckCircle2
            size={13}
          />,
      },

      REJECTED: {
        label:
          "Needs attention",
        className:
          "bg-red-100 text-red-700",
        icon:
          <XCircle
            size={13}
          />,
      },
    }[
      status
    ];

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
  value:
    string
): string {

  return value
    .toLowerCase()
    .split(
      "_"
    )
    .map(
      (part) =>
        part
          .charAt(
            0
          )
          .toUpperCase() +
        part.slice(
          1
        )
    )
    .join(
      " "
    );
}

function formatFileSize(
  value:
    number
): string {

  if (
    value <
    1024
  ) {
    return `${value} B`;
  }

  const kb =
    value /
    1024;

  if (
    kb <
    1024
  ) {
    return `${kb.toFixed(
      1
    )} KB`;
  }

  const mb =
    kb /
    1024;

  return `${mb.toFixed(
    1
  )} MB`;
}