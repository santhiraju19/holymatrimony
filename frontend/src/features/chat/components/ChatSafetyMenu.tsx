
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
  Trash2,
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

  blockStatus:
    BlockStatusResponse | null;

  onBlockStatusChange: (
    status: BlockStatusResponse
  ) => void;

  onDeleteConversation: (
    conversationId: string
  ) => Promise<void>;
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
  onDeleteConversation,
}: ChatSafetyMenuProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    blockDialogOpen,
    setBlockDialogOpen,
  ] = useState(false);

  const [
    reportDialogOpen,
    setReportDialogOpen,
  ] = useState(false);

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    working,
    setWorking,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const [
    success,
    setSuccess,
  ] = useState<string | null>(
    null
  );

  const [
    reportReason,
    setReportReason,
  ] = useState<ReportReason>(
    "INAPPROPRIATE_MESSAGES"
  );

  const [
    reportDetails,
    setReportDetails,
  ] = useState("");

  const blockedByMe =
    blockStatus?.blockedByMe ===
    true;

  /*
   * ============================================================
   * CLOSE MENU WHEN CLICKING OUTSIDE
   * ============================================================
   */

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

  /*
   * ============================================================
   * RESET WHEN CONVERSATION CHANGES
   * ============================================================
   */

  useEffect(() => {
    setMenuOpen(false);

    setBlockDialogOpen(
      false
    );

    setReportDialogOpen(
      false
    );

    setDeleteDialogOpen(
      false
    );

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

  /*
   * ============================================================
   * BLOCK / UNBLOCK
   * ============================================================
   */

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
              .unblockUser(
                userId
              )
          : await safetyService
              .blockUser(
                userId
              );

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

  /*
   * ============================================================
   * DELETE CHAT
   * ============================================================
   *
   * Deletes the conversation only for the
   * currently authenticated user.
   *
   * Backend keeps the shared conversation
   * and message history for the other user.
   */

  async function handleDeleteConversation() {
    if (working) {
      return;
    }

    setWorking(true);
    setError(null);
    setSuccess(null);

    try {
      await onDeleteConversation(
        conversationId
      );

      setDeleteDialogOpen(
        false
      );
    } catch (caughtError) {
      console.error(
        "[Chat Safety] Delete conversation failed:",
        caughtError
      );

      setError(
        "Unable to delete this chat. Please try again."
      );
    } finally {
      setWorking(false);
    }
  }

  /*
   * ============================================================
   * REPORT USER
   * ============================================================
   */

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
      {/* =======================================================
          THREE-DOT MENU
          ======================================================= */}

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
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0B2D5C]"
        >
          <MoreVertical
            size={18}
          />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-40 mt-2 w-52 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_38px_rgba(15,23,42,0.16)] sm:w-56">

            {/* Report */}

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);

                setError(null);

                setReportDialogOpen(
                  true
                );
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-[#0B2D5C]"
            >
              <Flag size={17} />

              Report user
            </button>

            {/* Block / Unblock */}

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);

                setError(null);

                setBlockDialogOpen(
                  true
                );
              }}
              className={[
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold transition",

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

            {/* Divider */}

            <div className="my-1 border-t border-slate-100" />

            {/* Delete chat */}

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);

                setError(null);
                setSuccess(null);

                setDeleteDialogOpen(
                  true
                );
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={17} />

              Delete chat
            </button>
          </div>
        )}
      </div>

      {/* =======================================================
          SUCCESS TOAST
          ======================================================= */}

      {success && (
        <div className="fixed bottom-3 left-3 right-3 z-[70] flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-white px-3.5 py-2.5 text-xs font-bold text-emerald-700 shadow-[0_14px_38px_rgba(15,23,42,0.16)] sm:bottom-5 sm:left-auto sm:right-5 sm:max-w-sm">
          <CheckCircle2
            size={18}
            className="shrink-0"
          />

          <span className="min-w-0 flex-1">
            {success}
          </span>

          <button
            type="button"
            aria-label="Close notification"
            onClick={() =>
              setSuccess(null)
            }
            className="shrink-0 rounded-lg p-1 transition hover:bg-emerald-50"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* =======================================================
          BLOCK / UNBLOCK DIALOG
          ======================================================= */}

      {blockDialogOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-[2px] sm:p-4">
          <div className="my-auto w-full max-w-md overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.24)] sm:p-5">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
                {blockedByMe ? (
                  <Undo2 size={21} />
                ) : (
                  <ShieldAlert
                    size={21}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black tracking-[-0.015em] text-[#0B2D5C]">
                  {blockedByMe
                    ? `Unblock ${userName}?`
                    : `Block ${userName}?`}
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  {blockedByMe
                    ? "Messaging can resume if it is otherwise permitted."
                    : "Neither of you will be able to send new messages. Existing chat history will remain visible."}
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                <AlertTriangle
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {error}
                </span>
              </div>
            )}

            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={working}
                onClick={() => {
                  setBlockDialogOpen(
                    false
                  );

                  setError(null);
                }}
                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={working}
                onClick={() => {
                  void handleBlockAction();
                }}
                className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-3.5 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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

      {/* =======================================================
          DELETE CHAT DIALOG
          ======================================================= */}

      {deleteDialogOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-[2px] sm:p-4">
          <div className="my-auto w-full max-w-md overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.24)] sm:p-5">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
                <Trash2
                  size={21}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black tracking-[-0.015em] text-[#0B2D5C]">
                  Delete chat with{" "}
                  {userName}?
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  This chat will be removed
                  from your conversation list.
                  The other member will still
                  keep their copy of the
                  conversation.
                </p>

                <p className="mt-1.5 text-[10px] leading-5 text-slate-400">
                  If a new message is exchanged
                  later, the conversation may
                  appear again.
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                <AlertTriangle
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {error}
                </span>
              </div>
            )}

            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={working}
                onClick={() => {
                  setDeleteDialogOpen(
                    false
                  );

                  setError(null);
                }}
                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={working}
                onClick={() => {
                  void handleDeleteConversation();
                }}
                className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-3.5 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {working ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />

                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2
                      size={16}
                    />

                    Delete chat
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          REPORT DIALOG
          ======================================================= */}

      {reportDialogOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-[2px] sm:p-4">
          <form
            onSubmit={
              handleReport
            }
            className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.24)] sm:max-h-[calc(100vh-2rem)] sm:p-5"
          >
            <h3 className="text-base font-black tracking-[-0.015em] text-[#0B2D5C]">
              Report {userName}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Select the reason that best
              describes the issue.
            </p>

            <div className="mt-3 space-y-1.5">
              {REPORT_REASONS.map(
                (option) => (
                  <label
                    key={
                      option.value
                    }
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50/50"
                  >
                    <input
                      type="radio"
                      name="reportReason"
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

                    <span>
                      {option.label}
                    </span>
                  </label>
                )
              )}
            </div>

            <textarea
              value={
                reportDetails
              }
              maxLength={1000}
              rows={4}
              onChange={(
                event
              ) =>
                setReportDetails(
                  event.target.value
                )
              }
              placeholder="Additional details (optional)"
              className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs leading-5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertTriangle
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {error}
                </span>
              </div>
            )}

            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={working}
                onClick={() => {
                  setReportDialogOpen(
                    false
                  );

                  setError(null);
                }}
                className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={working}
                className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0B2D5C] to-blue-700 px-3.5 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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