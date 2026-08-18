"use client";

import {
  Church,
  FileText,
  Loader2,
  ShieldCheck,
  Upload,
  UserRoundCheck,
} from "lucide-react";

import type {
  ChurchVerificationMethod,
  VerificationItem,
  VerificationStatus,
} from "@/features/verification/types";

interface ChurchVerificationCardProps {
  status: VerificationStatus;
  item?: VerificationItem;

  method: ChurchVerificationMethod;

  pastorName: string;
  churchPhone: string;
  churchEmail: string;

  membershipId: string;

  file: File | null;
  note: string;

  message?: string | null;
  error?: string | null;

  submitting: boolean;

  onMethodChange:
    (method: ChurchVerificationMethod) => void;

  onPastorNameChange:
    (value: string) => void;

  onChurchPhoneChange:
    (value: string) => void;

  onChurchEmailChange:
    (value: string) => void;

  onMembershipIdChange:
    (value: string) => void;

  onFileChange:
    (file: File | null) => void;

  onNoteChange:
    (value: string) => void;

  onSubmit:
    () => void;
}

function statusLabel(
  status: VerificationStatus
): string {

  switch (status) {

    case "PENDING":
      return "Under Review";

    case "APPROVED":
      return "Verified";

    case "REJECTED":
      return "Rejected";

    default:
      return "Not Submitted";
  }
}

export default function ChurchVerificationCard({
  status,
  item,

  method,

  pastorName,
  churchPhone,
  churchEmail,

  membershipId,

  file,
  note,

  message,
  error,

  submitting,

  onMethodChange,

  onPastorNameChange,
  onChurchPhoneChange,
  onChurchEmailChange,

  onMembershipIdChange,

  onFileChange,
  onNoteChange,

  onSubmit,
}: ChurchVerificationCardProps) {

  const locked =
    status === "PENDING" ||
    status === "APPROVED";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-start justify-between gap-4">

        <div className="flex items-start gap-4">

          <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
            <Church size={24} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Church Verification
            </h3>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
              Verify your church affiliation using a church-issued
              document, pastor or church contact, or a membership ID.
              A membership number is not required unless you choose
              that verification method.
            </p>
          </div>

        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {statusLabel(status)}
        </span>

      </div>

      {status === "REJECTED" &&
        item?.reviewReason && (

          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">

            <p className="text-sm font-semibold text-red-800">
              Verification was rejected
            </p>

            <p className="mt-1 text-sm text-red-700">
              {item.reviewReason}
            </p>

            <p className="mt-2 text-xs text-red-700">
              You may correct the information and submit again.
            </p>

          </div>
        )}

      {status === "PENDING" && (

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">

          <div className="flex gap-3">

            <ShieldCheck
              className="mt-0.5 text-amber-700"
              size={20}
            />

            <div>
              <p className="text-sm font-semibold text-amber-900">
                Your church verification is under review.
              </p>

              <p className="mt-1 text-sm text-amber-800">
                You cannot submit another request until the current
                review is completed.
              </p>
            </div>

          </div>

        </div>
      )}

      {status === "APPROVED" && (

        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

          <div className="flex gap-3">

            <ShieldCheck
              className="mt-0.5 text-emerald-700"
              size={20}
            />

            <div>
              <p className="text-sm font-semibold text-emerald-900">
                Your church affiliation has been verified.
              </p>

              <p className="mt-1 text-sm text-emerald-800">
                No further action is required.
              </p>
            </div>

          </div>

        </div>
      )}

      {!locked && (

        <>
          <div className="mt-6">

            <p className="text-sm font-semibold text-slate-900">
              How would you like to verify your church affiliation?
            </p>

            <div className="mt-3 grid gap-3 md:grid-cols-3">

              <button
                type="button"
                onClick={() =>
                  onMethodChange(
                    "DOCUMENT"
                  )
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  method === "DOCUMENT"
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <FileText
                  size={21}
                  className={
                    method === "DOCUMENT"
                      ? "text-blue-700"
                      : "text-slate-600"
                  }
                />

                <p className="mt-3 text-sm font-semibold text-slate-900">
                  Church-issued document
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Baptism certificate, recommendation letter,
                  ministry letter or another church-issued proof.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  onMethodChange(
                    "PASTOR_CONTACT"
                  )
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  method === "PASTOR_CONTACT"
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <UserRoundCheck
                  size={21}
                  className={
                    method === "PASTOR_CONTACT"
                      ? "text-blue-700"
                      : "text-slate-600"
                  }
                />

                <p className="mt-3 text-sm font-semibold text-slate-900">
                  Pastor / Church Contact
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Provide a church phone number or email so our
                  verification team can review the affiliation.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  onMethodChange(
                    "MEMBERSHIP_ID"
                  )
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  method === "MEMBERSHIP_ID"
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <ShieldCheck
                  size={21}
                  className={
                    method === "MEMBERSHIP_ID"
                      ? "text-blue-700"
                      : "text-slate-600"
                  }
                />

                <p className="mt-3 text-sm font-semibold text-slate-900">
                  Membership ID
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Use this only if your church actually provides
                  a membership or member number.
                </p>
              </button>

            </div>
          </div>

          {method === "DOCUMENT" && (

            <div className="mt-6">

              <label className="text-sm font-semibold text-slate-900">
                Church verification document
              </label>

              <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 p-4 transition hover:border-blue-500">

                <Upload
                  size={21}
                  className="text-slate-500"
                />

                <div className="min-w-0">

                  <p className="text-sm font-medium text-slate-800">
                    {file
                      ? file.name
                      : "Choose JPEG, PNG or PDF"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Maximum file size: 5 MB
                  </p>

                </div>

                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={(event) =>
                    onFileChange(
                      event.target.files?.[0] ??
                        null
                    )
                  }
                />

              </label>
            </div>
          )}

          {method === "PASTOR_CONTACT" && (

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-900">
                  Pastor / Church Contact Name
                </label>

                <input
                  value={pastorName}
                  onChange={(event) =>
                    onPastorNameChange(
                      event.target.value
                    )
                  }
                  placeholder="Pastor, priest or church office contact"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-900">
                  Church Phone
                </label>

                <input
                  type="tel"
                  value={churchPhone}
                  onChange={(event) =>
                    onChurchPhoneChange(
                      event.target.value
                    )
                  }
                  placeholder="+91..."
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-900">
                  Church Email
                </label>

                <input
                  type="email"
                  value={churchEmail}
                  onChange={(event) =>
                    onChurchEmailChange(
                      event.target.value
                    )
                  }
                  placeholder="church@example.com"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600"
                />
              </div>

              <p className="md:col-span-2 text-xs text-slate-500">
                Provide at least a church phone number or church email.
                Pastor/contact name is recommended but optional.
              </p>

            </div>
          )}

          {method === "MEMBERSHIP_ID" && (

            <div className="mt-6">

              <label className="text-sm font-semibold text-slate-900">
                Membership ID / Member Number
              </label>

              <input
                value={membershipId}
                onChange={(event) =>
                  onMembershipIdChange(
                    event.target.value
                  )
                }
                placeholder="Enter the membership number issued by your church"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600"
              />

              <div className="mt-4">

                <label className="text-sm font-semibold text-slate-900">
                  Supporting document
                  <span className="ml-1 font-normal text-slate-500">
                    (optional)
                  </span>
                </label>

                <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 p-4 transition hover:border-blue-500">

                  <Upload
                    size={21}
                    className="text-slate-500"
                  />

                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {file
                        ? file.name
                        : "Optional JPEG, PNG or PDF"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Maximum file size: 5 MB
                    </p>
                  </div>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    className="hidden"
                    onChange={(event) =>
                      onFileChange(
                        event.target.files?.[0] ??
                          null
                      )
                    }
                  />

                </label>

              </div>

            </div>
          )}

          <div className="mt-6">

            <label className="text-sm font-semibold text-slate-900">
              Note
              <span className="ml-1 font-normal text-slate-500">
                (optional)
              </span>
            </label>

            <textarea
              value={note}
              onChange={(event) =>
                onNoteChange(
                  event.target.value
                )
              }
              rows={3}
              placeholder="Anything helpful for the verification team..."
              className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600"
            />
          </div>

          {error && (
            <p className="mt-4 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-4 text-sm font-medium text-emerald-700">
              {message}
            </p>
          )}

          <button
            type="button"
            disabled={submitting}
            onClick={onSubmit}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {submitting ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Submitting...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Submit Church Verification
              </>
            )}

          </button>
        </>
      )}
    </section>
  );
}