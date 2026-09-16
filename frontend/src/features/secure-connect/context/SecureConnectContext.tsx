"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getApiErrorMessage } from "@/lib/api";

import secureConnectWebSocketService from "../api/secure-connect-websocket.service";
import secureConnectService from "../services/secureConnect.service";

import {
  CallMediaType,
  SecureConnectActiveCall,
  SecureConnectCall,
  SecureConnectCallEvent,
  SecureConnectMember,
  SecureConnectSocketStatus,
} from "../types";

interface SecureConnectContextValue {
  activeCall:
    SecureConnectActiveCall | null;

  socketStatus:
    SecureConnectSocketStatus;

  busy: boolean;

  error:
    string | null;

  initiateCall: (
    calleeUserId: string,
    mediaType: CallMediaType,
    member?: SecureConnectMember | null
  ) => Promise<SecureConnectCall>;

  acceptCall:
    () => Promise<void>;

  declineCall:
    () => Promise<void>;

  cancelCall:
    () => Promise<void>;

  endCall:
    () => Promise<void>;

  updateCall: (
    call: SecureConnectCall
  ) => void;

  clearCall:
    () => void;

  clearError:
    () => void;
}

const SecureConnectContext =
  createContext<
    SecureConnectContextValue | undefined
  >(undefined);

interface Props {
  children: ReactNode;
}

function callFromEvent(
  event: SecureConnectCallEvent
): SecureConnectCall {
  /*
   * Realtime signaling carries only the
   * privacy-safe call state. REST remains
   * authoritative for lifecycle timestamps.
   */
  return {
    callId: event.callId,
    callerUserId: "",
    calleeUserId: "",
    mediaType: event.mediaType,
    status: event.status,
    initiatedAt: event.occurredAt,
    answeredAt:
      event.eventType === "CALL_ACCEPTED"
        ? event.occurredAt
        : null,
    connectedAt: null,
    endedAt:
      isTerminalEvent(event)
        ? event.occurredAt
        : null,
    durationSeconds: null,
  };
}

function isTerminalEvent(
  event: SecureConnectCallEvent
): boolean {
  return (
    event.eventType ===
      "CALL_DECLINED" ||
    event.eventType ===
      "CALL_CANCELLED" ||
    event.eventType ===
      "CALL_MISSED" ||
    event.eventType ===
      "CALL_FAILED" ||
    event.eventType ===
      "CALL_ENDED"
  );
}

export function SecureConnectProvider({
  children,
}: Props) {
  const [
    activeCall,
    setActiveCall,
  ] =
    useState<
      SecureConnectActiveCall | null
    >(null);

  const [
    socketStatus,
    setSocketStatus,
  ] =
    useState<SecureConnectSocketStatus>(
      "disconnected"
    );

  const [
    busy,
    setBusy,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  /*
   * WebSocket callbacks must always see the
   * latest call without forcing the socket
   * connection to be recreated.
   */
  const activeCallRef =
    useRef<
      SecureConnectActiveCall | null
    >(null);

  useEffect(() => {
    activeCallRef.current =
      activeCall;
  }, [activeCall]);

  /*
   * Replace the REST-authoritative call payload while
   * preserving frontend-only direction/member metadata.
   *
   * This is used when the media layer reports a successful
   * LiveKit connection and the backend returns connectedAt.
   */
  const updateCall =
    useCallback(
      (
        call: SecureConnectCall
      ) => {
        setActiveCall((current) => {
          if (
            !current ||
            current.call.callId !==
              call.callId
          ) {
            return current;
          }

          return {
            ...current,
            call,
          };
        });
      },
      []
    );

  const clearCall =
    useCallback(() => {
      setActiveCall(null);
    }, []);

  const clearError =
    useCallback(() => {
      setError(null);
    }, []);

  const handleCallEvent =
    useCallback(
      (
        event:
          SecureConnectCallEvent
      ) => {
        const current =
          activeCallRef.current;

        /*
         * A brand-new incoming call creates
         * the recipient's global call state.
         */
        if (
          event.eventType ===
          "CALL_INCOMING"
        ) {
          /*
           * For now, keep one visible call at
           * a time. A later busy-call policy
           * can automatically reject a second
           * simultaneous incoming call.
           */
          if (
            current &&
            current.call.callId !==
              event.callId
          ) {
            return;
          }

          setActiveCall({
            call:
              callFromEvent(
                event
              ),

            direction:
              "incoming",

            otherMember:
              event.otherMember ??
              null,
          });

          return;
        }

        /*
         * Events for another call must not
         * overwrite the currently displayed
         * call.
         */
        if (
          !current ||
          current.call.callId !==
            event.callId
        ) {
          return;
        }

        if (
          event.eventType ===
          "CALL_ACCEPTED"
        ) {
          setActiveCall({
            ...current,

            call: {
              ...current.call,
              status:
                event.status,

              answeredAt:
                event.occurredAt,
            },

            otherMember:
              event.otherMember ??
              current.otherMember,
          });

          return;
        }

        if (
          isTerminalEvent(
            event
          )
        ) {
          setActiveCall({
            ...current,

            call: {
              ...current.call,
              status:
                event.status,

              endedAt:
                event.occurredAt,

              durationSeconds:
                current.call.durationSeconds,
            },

            otherMember:
              event.otherMember ??
              current.otherMember,
          });
        }
      },
      []
    );

  useEffect(() => {
    secureConnectWebSocketService.connect({
      onCallEvent:
        handleCallEvent,

      onStatusChange:
        setSocketStatus,

      onError:
        (message) => {
          setError(
            message
          );
        },
    });

    return () => {
      secureConnectWebSocketService.disconnect();
    };
  }, [handleCallEvent]);

  const initiateCall =
    useCallback(
      async (
        calleeUserId:
          string,

        mediaType:
          CallMediaType,

        member:
          SecureConnectMember | null =
          null
      ): Promise<SecureConnectCall> => {
        setBusy(true);
        setError(null);

        try {
          const call =
            await secureConnectService.initiateCall(
              calleeUserId,
              mediaType
            );

          setActiveCall({
            call,
            direction:
              "outgoing",
            otherMember:
              member,
          });

          return call;
        } catch (requestError) {
          const message =
            getApiErrorMessage(
              requestError,
              "Unable to start the secure call."
            );

          setError(message);

          throw requestError;
        } finally {
          setBusy(false);
        }
      },
      []
    );

  const acceptCall =
    useCallback(
      async (): Promise<void> => {
        const current =
          activeCallRef.current;

        if (
          !current ||
          current.direction !==
            "incoming" ||
          current.call.status !==
            "RINGING"
        ) {
          return;
        }

        setBusy(true);
        setError(null);

        try {
          const call =
            await secureConnectService.acceptCall(
              current.call.callId
            );

          setActiveCall({
            ...current,
            call,
          });
        } catch (requestError) {
          setError(
            getApiErrorMessage(
              requestError,
              "Unable to accept the secure call."
            )
          );

          throw requestError;
        } finally {
          setBusy(false);
        }
      },
      []
    );

  const declineCall =
    useCallback(
      async (): Promise<void> => {
        const current =
          activeCallRef.current;

        if (
          !current ||
          current.direction !==
            "incoming" ||
          current.call.status !==
            "RINGING"
        ) {
          return;
        }

        setBusy(true);
        setError(null);

        try {
          const call =
            await secureConnectService.declineCall(
              current.call.callId
            );

          setActiveCall({
            ...current,
            call,
          });
        } catch (requestError) {
          setError(
            getApiErrorMessage(
              requestError,
              "Unable to decline the secure call."
            )
          );

          throw requestError;
        } finally {
          setBusy(false);
        }
      },
      []
    );

  const cancelCall =
    useCallback(
      async (): Promise<void> => {
        const current =
          activeCallRef.current;

        if (
          !current ||
          current.direction !==
            "outgoing" ||
          current.call.status !==
            "RINGING"
        ) {
          return;
        }

        setBusy(true);
        setError(null);

        try {
          const call =
            await secureConnectService.cancelCall(
              current.call.callId
            );

          setActiveCall({
            ...current,
            call,
          });
        } catch (requestError) {
          setError(
            getApiErrorMessage(
              requestError,
              "Unable to cancel the secure call."
            )
          );

          throw requestError;
        } finally {
          setBusy(false);
        }
      },
      []
    );

  const endCall =
    useCallback(
      async (): Promise<void> => {
        const current =
          activeCallRef.current;

        if (
          !current ||
          current.call.status !==
            "ACCEPTED"
        ) {
          return;
        }

        setBusy(true);
        setError(null);

        try {
          const call =
            await secureConnectService.endCall(
              current.call.callId
            );

          setActiveCall({
            ...current,
            call,
          });
        } catch (requestError) {
          setError(
            getApiErrorMessage(
              requestError,
              "Unable to end the secure call."
            )
          );

          throw requestError;
        } finally {
          setBusy(false);
        }
      },
      []
    );

  const value =
    useMemo<
      SecureConnectContextValue
    >(
      () => ({
        activeCall,
        socketStatus,
        busy,
        error,
        initiateCall,
        acceptCall,
        declineCall,
        cancelCall,
        endCall,
        updateCall,
        clearCall,
        clearError,
      }),
      [
        activeCall,
        socketStatus,
        busy,
        error,
        initiateCall,
        acceptCall,
        declineCall,
        cancelCall,
        endCall,
        updateCall,
        clearCall,
        clearError,
      ]
    );

  return (
    <SecureConnectContext.Provider
      value={value}
    >
      {children}
    </SecureConnectContext.Provider>
  );
}

export function useSecureConnect():
  SecureConnectContextValue {
  const context =
    useContext(
      SecureConnectContext
    );

  if (!context) {
    throw new Error(
      "useSecureConnect must be used inside SecureConnectProvider."
    );
  }

  return context;
}

export default SecureConnectProvider;
