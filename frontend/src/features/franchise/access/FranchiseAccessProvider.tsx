"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getCurrentFranchiseAccess } from "../api/franchiseApi";

import type {
  FranchiseAccess,
  FranchisePermission,
} from "../types/franchiseAccess";

interface FranchiseAccessContextValue {
  access: FranchiseAccess | null;
  loading: boolean;
  error: string | null;

  hasPermission: (
    permission: FranchisePermission
  ) => boolean;

  refreshAccess: () => Promise<void>;
}

const FranchiseAccessContext =
  createContext<FranchiseAccessContextValue | null>(
    null
  );

interface FranchiseAccessProviderProps {
  children: ReactNode;
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response =
      (
        error as {
          response?: {
            data?: {
              message?: unknown;
            };
          };
        }
      ).response;

    if (
      typeof response?.data?.message === "string" &&
      response.data.message.trim()
    ) {
      return response.data.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Unable to load franchise access.";
}

export function FranchiseAccessProvider({
  children,
}: FranchiseAccessProviderProps) {
  const [access, setAccess] =
    useState<FranchiseAccess | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const refreshAccess =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const currentAccess =
          await getCurrentFranchiseAccess();

        setAccess(currentAccess);
      } catch (requestError) {
        setAccess(null);
        setError(
          getErrorMessage(requestError)
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void refreshAccess();
  }, [refreshAccess]);

  const permissionSet =
    useMemo(
      () =>
        new Set<FranchisePermission>(
          access?.permissions ?? []
        ),
      [access]
    );

  const hasPermission =
    useCallback(
      (
        permission: FranchisePermission
      ) => permissionSet.has(permission),
      [permissionSet]
    );

  const value =
    useMemo<FranchiseAccessContextValue>(
      () => ({
        access,
        loading,
        error,
        hasPermission,
        refreshAccess,
      }),
      [
        access,
        loading,
        error,
        hasPermission,
        refreshAccess,
      ]
    );

  return (
    <FranchiseAccessContext.Provider
      value={value}
    >
      {children}
    </FranchiseAccessContext.Provider>
  );
}

export function useFranchiseAccess(): FranchiseAccessContextValue {
  const context =
    useContext(FranchiseAccessContext);

  if (!context) {
    throw new Error(
      "useFranchiseAccess must be used within FranchiseAccessProvider."
    );
  }

  return context;
}
