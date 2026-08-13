    "use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Flag,
  Loader2,
  MoreVertical,
  ShieldAlert,
  Undo2,
  X,
} from "lucide-react";

import safetyService, {
  BlockStatusResponse,
  ReportReason,
} from "@/features/safety/api/safety.service";

interface ChatSafetyMenuProps {
  userId: string;
  userName: string;
  conversationId: string;
  blockStatus: BlockStatusResponse | null;

  onBlockStatusChange: (
    status: BlockStatusResponse
  ) => void;
}

const REPORT_REASONS: Array<{
  value: ReportReason;
  label: string;
}> = [
  {
    value: "INAPPROPRIATE_MESSAGES",
    label: "Inappropriate messages",
  },
  {
    value: "HARASSMENT",
    label: "Harassment",
  },
  {
    value: "FAKE_PROFILE",
    label: "Fake profile",
  },
  {
    value: "SCAM_OR_FRAUD",
    label: "Scam or fraud",
  },
  {
    value: "OFFENSIVE_CONTENT",
    label: "Offensive content",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

export default function ChatSafetyMenu({
  userId,
  userName,
  conversationId,
  blockStatus,
  onBlockStatusChange,
}: ChatSafetyMenuProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [
    blockDialogOpen,
    setBlockDialogOpen,
  ] = useState(false);

  const [
    reportDialogOpen,
    setReportDialogOpen,
  ] = useState(false);

  const [working, setWorking] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null
    );

  const [success, setSuccess] =
    useState<string | null>(
      null
    );

  const [
    reportReason,
    setReportReason,
  ] =
    useState<ReportReason>(
      "INAPPROPRIATE_MESSAGES"
    );

  const [
    reportDetails,
    setReportDetails,
  ] = useState("");

  const blockedByMe =
    blockStatus?.blockedByMe ===
    true;

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setBlockDialogOpen(false);
    setReportDialogOpen(false);
    setError(null);
    setSuccess(null);
    setReportDetails("");
    setReportReason(
      "INAPPROPRIATE_MESSAGES"
    );
  }, [
    userId,
    conversationId,
  ]);

  async function handleBlockAction() {
    if (working) {
      return;
    }

    setWorking(true);
    setError(null);
    setSuccess(null);

    try {
      const nextStatus =
        blockedByMe
          ? await safetyService
              .unblockUser(userId)
          : await safetyService
              .blockUser(userId);

      onBlockStatusChange(
        nextStatus
      );

      setBlockDialogOpen(
        false
      );

      setSuccess(
        blockedByMe
          ? `${userName} has been unblocked.`
          : `${userName} has been blocked.`
      );
    } catch (caughtError) {
      console.error(
        "[Chat Safety] Block action failed:",
        caughtError
      );

      setError(
        blockedByMe
          ? "Unable to unblock this member. Please try again."
          : "Unable to block this member. Please try again."
      );
    } finally {
      setWorking(false);
    }
  }

  async function handleReport(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (working) {
      return;
    }

    setWorking(true);
    setError(null);
    setSuccess(null);

    try {
      await safetyService
        .reportUser(
          userId,
          {
            reason:
              reportReason,

            details:
              reportDetails.trim() ||
              undefined,

            conversationId,
          }
        );

      setReportDialogOpen(
        false
      );

      setReportDetails("");

      setReportReason(
        "INAPPROPRIATE_MESSAGES"
      );

      setSuccess(
        "Report submitted. Our team will review it."
      );
    } catch (caughtError) {
      console.error(
        "[Chat Safety] Report failed:",
        caughtError
      );

      setError(
        "Unable to submit the report. Please try again."
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <>
      <div
        ref={containerRef}
        className="relative"
      >
        <button
          type="button"
          aria-label="Chat options"
          title="Chat options"
          onClick={() => {
            setMenuOpen(
              (current) =>
                !current
            );

            setError(null);
            setSuccess(null);
          }}
          className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100"
        >
          <MoreVertical
            size={18}
          />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-40 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setReportDialogOpen(
                  true
                );
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Flag size={17} />
              Report user
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setBlockDialogOpen(
                  true
                );
              }}
              className={[
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",

                blockedByMe
                  ? "text-blue-700 hover:bg-blue-50"
                  : "text-red-700 hover:bg-red-50",
              ].join(" ")}
            >
              {blockedByMe ? (
                <Undo2 size={17} />
              ) : (
                <Ban size={17} />
              )}

              {blockedByMe
                ? "Unblock user"
                : "Block user"}
            </button>
          </div>
        )}
      </div>

      {success && (
        <div className="fixed bottom-5 right-5 z-[70] flex max-w-sm items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-700 shadow-xl">
          <CheckCircle2
            size={18}
          />

          {success}

          <button
            type="button"
            onClick={() =>
              setSuccess(null)
            }
          >
            <X size={15} />
          </button>
        </div>
      )}

      {blockDialogOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-700">
                {blockedByMe ? (
                  <Undo2 size={21} />
                ) : (
                  <ShieldAlert
                    size={21}
                  />
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">
                  {blockedByMe
                    ? `Unblock ${userName}?`
                    : `Block ${userName}?`}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {blockedByMe
                    ? "Messaging can resume if it is otherwise permitted."
                    : "Neither of you will be able to send new messages. Existing chat history will remain visible."}
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertTriangle
                  size={17}
                />
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={working}
                onClick={() =>
                  setBlockDialogOpen(
                    false
                  )
                }
                className="rounded-xl border px-4 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={working}
                onClick={() =>
                  void handleBlockAction()
                }
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {working && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {blockedByMe
                  ? "Unblock"
                  : "Block user"}
              </button>
            </div>
          </div>
        </div>
      )}

      {reportDialogOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4">
          <form
            onSubmit={
              handleReport
            }
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-slate-900">
              Report {userName}
            </h3>

            <div className="mt-5 space-y-2">
              {REPORT_REASONS.map(
                (option) => (
                  <label
                    key={
                      option.value
                    }
                    className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm"
                  >
                    <input
                      type="radio"
                      checked={
                        reportReason ===
                        option.value
                      }
                      onChange={() =>
                        setReportReason(
                          option.value
                        )
                      }
                    />

                    {option.label}
                  </label>
                )
              )}
            </div>

            <textarea
              value={reportDetails}
              maxLength={1000}
              rows={4}
              onChange={(event) =>
                setReportDetails(
                  event.target.value
                )
              }
              placeholder="Additional details (optional)"
              className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />

            {error && (
              <p className="mt-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={working}
                onClick={() =>
                  setReportDialogOpen(
                    false
                  )
                }
                className="rounded-xl border px-4 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={working}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {working && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                Submit report
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}