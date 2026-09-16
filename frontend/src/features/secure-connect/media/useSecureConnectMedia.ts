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
    SecureConnectActiveCall | null
): Result {
  const sessionRef =
    useRef<
      SecureConnectMediaSession | null
    >(null);

  const generationRef =
    useRef(0);

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
                setStatus,

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
