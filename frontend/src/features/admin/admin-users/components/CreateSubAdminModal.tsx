"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";

import {
  ADMIN_PERMISSIONS,
} from "@/features/admin/access/types";

import type {
  AdminPermission,
} from "@/features/admin/access/types";

import type {
  CreateSubAdminRequest,
} from "../types/adminSubAdmin";

interface CreateSubAdminModalProps {
  open: boolean;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onCreate: (
    request: CreateSubAdminRequest
  ) => Promise<void> | void;
}

function formatPermission(
  permission: AdminPermission
): string {
  return permission
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

export default function CreateSubAdminModal({
  open,
  loading = false,
  error = null,
  onClose,
  onCreate,
}: CreateSubAdminModalProps) {
  const [
    fullName,
    setFullName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    permissions,
    setPermissions,
  ] = useState<AdminPermission[]>([]);

  const [
    validationError,
    setValidationError,
  ] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setFullName("");
      setEmail("");
      setPermissions([]);
      setValidationError(null);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  function togglePermission(
    permission: AdminPermission
  ): void {
    setValidationError(null);

    setPermissions(
      (current) =>
        current.includes(permission)
          ? current.filter(
              (item) =>
                item !== permission
            )
          : [
              ...current,
              permission,
            ]
    );
  }

  function selectAllPermissions(): void {
    setValidationError(null);

    setPermissions(
      [...ADMIN_PERMISSIONS]
    );
  }

  function clearPermissions(): void {
    setPermissions([]);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    const trimmedName =
      fullName.trim();

    const trimmedEmail =
      email.trim();

    if (!trimmedName) {
      setValidationError(
        "Full name is required."
      );

      return;
    }

    if (!trimmedEmail) {
      setValidationError(
        "Email is required."
      );

      return;
    }

    if (!permissions.length) {
      setValidationError(
        "Select at least one admin permission."
      );

      return;
    }

    setValidationError(null);

    await onCreate({
      fullName: trimmedName,
      email: trimmedEmail,
      permissions,
    });
  }

  const displayedError =
    validationError || error;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-sub-admin-title"
    >
      <div className="max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B78A22]">
              Administration
            </p>

            <h2
              id="create-sub-admin-title"
              className="mt-2 text-xl font-bold text-slate-900"
            >
              Create Sub-admin
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Create an administrator account and choose exactly which admin areas they can access.
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            aria-label="Close create sub-admin dialog"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <div className="space-y-6 px-6 py-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="sub-admin-full-name"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                >
                  Full name
                </label>

                <input
                  id="sub-admin-full-name"
                  type="text"
                  value={fullName}
                  maxLength={120}
                  disabled={loading}
                  onChange={(event) => {
                    setFullName(
                      event.target.value
                    );
                    setValidationError(null);
                  }}
                  placeholder="Administrator name"
                  autoComplete="name"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div>
                <label
                  htmlFor="sub-admin-email"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                >
                  Email
                </label>

                <input
                  id="sub-admin-email"
                  type="email"
                  value={email}
                  maxLength={150}
                  disabled={loading}
                  onChange={(event) => {
                    setEmail(
                      event.target.value
                    );
                    setValidationError(null);
                  }}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Admin Permissions
                    </h3>

                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      Select at least one permission. Access can be changed later.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={selectAllPermissions}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0B2D5C] transition hover:border-blue-200 hover:bg-blue-50 disabled:opacity-50"
                  >
                    Select all
                  </button>

                  <button
                    type="button"
                    disabled={
                      loading ||
                      !permissions.length
                    }
                    onClick={clearPermissions}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {ADMIN_PERMISSIONS.map(
                  (permission) => {
                    const checked =
                      permissions.includes(
                        permission
                      );

                    return (
                      <label
                        key={permission}
                        className={[
                          "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition",
                          checked
                            ? "border-blue-200 bg-blue-50"
                            : "border-slate-200 bg-white hover:border-slate-300",
                          loading
                            ? "cursor-not-allowed opacity-60"
                            : "",
                        ].join(" ")}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={loading}
                          onChange={() =>
                            togglePermission(
                              permission
                            )
                          }
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0B2D5C] accent-[#0B2D5C]"
                        />

                        <span className="text-sm font-semibold text-slate-700">
                          {formatPermission(
                            permission
                          )}
                        </span>
                      </label>
                    );
                  }
                )}
              </div>

              <p className="mt-4 text-xs font-medium text-slate-500">
                {permissions.length}{" "}
                {permissions.length === 1
                  ? "permission"
                  : "permissions"}{" "}
                selected
              </p>
            </div>

            {displayedError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {displayedError}
              </div>
            )}

            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
              After creation, Holy Matrimony will send the administrator a password setup OTP using the configured account setup flow.
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] px-5 text-sm font-bold text-white transition hover:bg-[#123D73] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserPlus size={16} />

              {loading
                ? "Creating..."
                : "Create Sub-admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
