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

import {
  usePathname,
} from "next/navigation";

import {
  getCurrentAdminAccess,
} from "./adminAccessService";

import type {
  AdminAccess,
  AdminPermission,
} from "./types";

interface AdminAccessContextValue {
  access: AdminAccess | null;
  loading: boolean;
  error: string | null;
  isSuperAdmin: boolean;
  hasPermission: (
    permission: AdminPermission
  ) => boolean;
  refreshAccess: () => Promise<void>;
}

const AdminAccessContext =
  createContext<
    AdminAccessContextValue | undefined
  >(undefined);

interface AdminAccessProviderProps {
  children: ReactNode;
}

export function AdminAccessProvider({
  children,
}: AdminAccessProviderProps) {
  const pathname = usePathname();

  const [
    access,
    setAccess,
  ] = useState<AdminAccess | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const loadAccess =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await getCurrentAdminAccess();

        setAccess(result);
      } catch (loadError) {
        setAccess(null);

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load administrator access."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadAccess();
  }, [
    loadAccess,
    pathname,
  ]);

  const isSuperAdmin =
    access?.accessLevel ===
    "SUPER_ADMIN";

  const hasPermission =
    useCallback(
      (
        permission: AdminPermission
      ): boolean => {
        if (!access) {
          return false;
        }

        if (
          access.accessLevel ===
          "SUPER_ADMIN"
        ) {
          return true;
        }

        return access.permissions.includes(
          permission
        );
      },
      [access]
    );

  const value =
    useMemo<AdminAccessContextValue>(
      () => ({
        access,
        loading,
        error,
        isSuperAdmin,
        hasPermission,
        refreshAccess: loadAccess,
      }),
      [
        access,
        loading,
        error,
        isSuperAdmin,
        hasPermission,
        loadAccess,
      ]
    );

  return (
    <AdminAccessContext.Provider
      value={value}
    >
      {children}
    </AdminAccessContext.Provider>
  );
}

export function useAdminAccess():
  AdminAccessContextValue {
  const context =
    useContext(AdminAccessContext);

  if (!context) {
    throw new Error(
      "useAdminAccess must be used within AdminAccessProvider."
    );
  }

  return context;
}
