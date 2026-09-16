"use client";

import {
  RemoteTrack,
} from "livekit-client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { getApiErrorMessage } from "@/lib/api";

import secureConnectService from "../services/secureConnect.service";

import {
  SecureConnectActiveCall,
} from "../types";

import {
  createSecureConnectMediaSession,
  SecureConnectMediaSession,
  SecureConnectMediaStatus,
} from "./secureConnectMedia";

interface Result {
  status: SecureConnectMediaStatus;

  error:
    string | null;

  microphoneEnabled:
    boolean;

  cameraEnabled:
    boolean;

  localVideoTrack:
    SecureConnectMediaSession["cameraTrack"];

  remoteAudioTrack:
    RemoteTrack | null;

  remoteVideoTrack:
    RemoteTrack | null;

  toggleMicrophone:
    () => Promise<void>;

  toggleCamera:
    () => Promise<void>;
}

export function useSecureConnectMedia(
  activeCall:
    SecureConnectActiveCall | null,
  onCallUpdated?: (
    call: SecureConnectActiveCall["call"]
  ) => void
): Result {
  const sessionRef =
    useRef<
      SecureConnectMediaSession | null
    >(null);

  const generationRef =
    useRef(0);

  /*
   * A participant may receive multiple media status callbacks
   * during the lifetime of one call. Report media connection
   * to the backend at most once per call from this hook.
   *
   * The backend endpoint is also idempotent, so both call
   * participants may safely report their own LiveKit success.
   */
  const connectedReportedCallIdRef =
    useRef<string | null>(null);

  const [
    status,
    setStatus,
  ] =
    useState<SecureConnectMediaStatus>(
      "idle"
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(null);

  const [
    microphoneEnabled,
    setMicrophoneEnabled,
  ] =
    useState(true);

  const [
    cameraEnabled,
    setCameraEnabled,
  ] =
    useState(true);

  const [
    localVideoTrack,
    setLocalVideoTrack,
  ] =
    useState<
      SecureConnectMediaSession["cameraTrack"]
    >(null);

  const [
    remoteAudioTrack,
    setRemoteAudioTrack,
  ] =
    useState<RemoteTrack | null>(
      null
    );

  const [
    remoteVideoTrack,
    setRemoteVideoTrack,
  ] =
    useState<RemoteTrack | null>(
      null
    );

  useEffect(() => {
    const call =
      activeCall?.call;

    if (
      !call ||
      call.status !== "ACCEPTED"
    ) {
      generationRef.current += 1;
      connectedReportedCallIdRef.current =
        null;

      const previous =
        sessionRef.current;

      sessionRef.current =
        null;

      setStatus("idle");
      setError(null);

      setLocalVideoTrack(null);
      setRemoteAudioTrack(null);
      setRemoteVideoTrack(null);

      setMicrophoneEnabled(true);
      setCameraEnabled(true);

      if (previous) {
        void previous.disconnect();
      }

      return;
    }

    /*
     * TypeScript cannot preserve the accepted-call
     * narrowing across the nested async function.
     * Capture the validated call before connecting.
     */
    const acceptedCall = call;

    const generation =
      ++generationRef.current;

    let disposed =
      false;

    async function reportMediaConnected() {
      if (
        disposed ||
        generationRef.current !== generation ||
        connectedReportedCallIdRef.current ===
          acceptedCall.callId
      ) {
        return;
      }

      connectedReportedCallIdRef.current =
        acceptedCall.callId;

      try {
        const connectedCall =
          await secureConnectService.markConnected(
            acceptedCall.callId
          );

        if (
          disposed ||
          generationRef.current !== generation
        ) {
          return;
        }

        onCallUpdated?.(connectedCall);
      } catch (requestError) {
        /*
         * Allow a later connected callback/retry to report again
         * when the request itself failed.
         */
        if (
          connectedReportedCallIdRef.current ===
          acceptedCall.callId
        ) {
          connectedReportedCallIdRef.current =
            null;
        }

        if (
          disposed ||
          generationRef.current !== generation
        ) {
          return;
        }

        setError(
          getApiErrorMessage(
            requestError,
            "Secure media connected, but the call connection time could not be recorded."
          )
        );
      }
    }

    async function connect() {
      setStatus("connecting");
      setError(null);

      try {
        const credentials =
          await secureConnectService
            .getMediaCredentials(
              acceptedCall.callId
            );

        if (
          disposed ||
          generationRef.current !==
            generation
        ) {
          return;
        }

        const session =
          await createSecureConnectMediaSession(
            credentials,
            {
              onStatusChange:
                (nextStatus) => {
                  setStatus(nextStatus);

                  if (
                    nextStatus === "connected"
                  ) {
                    void reportMediaConnected();
                  }
                },

              onRemoteAudioTrack:
                setRemoteAudioTrack,

              onRemoteVideoTrack:
                setRemoteVideoTrack,

              onError:
                setError,
            }
          );

        if (
          disposed ||
          generationRef.current !==
            generation
        ) {
          await session.disconnect();
          return;
        }

        sessionRef.current =
          session;

        setLocalVideoTrack(
          session.cameraTrack
        );

        setMicrophoneEnabled(
          session.microphoneTrack
            ? !session
                .microphoneTrack
                .isMuted
            : false
        );

        setCameraEnabled(
          session.cameraTrack
            ? !session
                .cameraTrack
                .isMuted
            : false
        );
      } catch (requestError) {
        if (
          disposed ||
          generationRef.current !==
            generation
        ) {
          return;
        }

        setStatus("error");

        setError(
          getApiErrorMessage(
            requestError,
            "Unable to establish the private media connection."
          )
        );
      }
    }

    void connect();

    return () => {
      disposed =
        true;

      generationRef.current +=
        1;

      const session =
        sessionRef.current;

      sessionRef.current =
        null;

      setLocalVideoTrack(null);
      setRemoteAudioTrack(null);
      setRemoteVideoTrack(null);

      if (session) {
        void session.disconnect();
      }
    };
  }, [
    activeCall?.call.callId,
    activeCall?.call.status,
    onCallUpdated,
  ]);

  const toggleMicrophone =
    useCallback(
      async (): Promise<void> => {
        const session =
          sessionRef.current;

        if (
          !session ||
          !session.microphoneTrack
        ) {
          return;
        }

        const next =
          !microphoneEnabled;

        await session
          .setMicrophoneEnabled(
            next
          );

        setMicrophoneEnabled(
          next
        );
      },
      [microphoneEnabled]
    );

  const toggleCamera =
    useCallback(
      async (): Promise<void> => {
        const session =
          sessionRef.current;

        if (
          !session ||
          !session.cameraTrack
        ) {
          return;
        }

        const next =
          !cameraEnabled;

        await session
          .setCameraEnabled(
            next
          );

        setCameraEnabled(
          next
        );
      },
      [cameraEnabled]
    );

  return {
    status,
    error,

    microphoneEnabled,
    cameraEnabled,

    localVideoTrack,
    remoteAudioTrack,
    remoteVideoTrack,

    toggleMicrophone,
    toggleCamera,
  };
}

export default useSecureConnectMedia;
