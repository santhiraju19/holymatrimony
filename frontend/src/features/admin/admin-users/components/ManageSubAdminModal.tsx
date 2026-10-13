"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Power,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  ADMIN_PERMISSIONS,
} from "@/features/admin/access/types";

import type {
  AdminPermission,
} from "@/features/admin/access/types";

import type {
  AdminSubAdmin,
  SubAdminStatus,
} from "../types/adminSubAdmin";

import SubAdminStatusBadge from "./SubAdminStatusBadge";

interface ManageSubAdminModalProps {
  open: boolean;
  subAdmin: AdminSubAdmin | null;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSavePermissions: (
    subAdmin: AdminSubAdmin,
    permissions: AdminPermission[]
  ) => Promise<void> | void;
  onChangeStatus: (
    subAdmin: AdminSubAdmin,
    status: SubAdminStatus,
    reason: string | null
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

export default function ManageSubAdminModal({
  open,
  subAdmin,
  loading = false,
  error = null,
  onClose,
  onSavePermissions,
  onChangeStatus,
}: ManageSubAdminModalProps) {
  const [
    permissions,
    setPermissions,
  ] = useState<AdminPermission[]>([]);

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    validationError,
    setValidationError,
  ] = useState<string | null>(null);

  useEffect(() => {
    if (open && subAdmin) {
      setPermissions(
        [...subAdmin.permissions]
      );
      setReason("");
      setValidationError(null);
    }
  }, [open, subAdmin]);

  if (!open || !subAdmin) {
    return null;
  }

  const permissionsChanged =
    permissions.length !==
      subAdmin.permissions.length ||
    permissions.some(
      (permission) =>
        !subAdmin.permissions.includes(
          permission
        )
    );

  const nextStatus: SubAdminStatus =
    subAdmin.status === "ACTIVE"
      ? "DEACTIVATED"
      : "ACTIVE";

  const deactivating =
    nextStatus === "DEACTIVATED";

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

  async function handleSavePermissions(): Promise<void> {
    if (!subAdmin) {
      return;
    }

    if (!permissions.length) {
      setValidationError(
        "Select at least one admin permission."
      );

      return;
    }

    const currentSubAdmin =
      subAdmin;

    setValidationError(null);

    await onSavePermissions(
      currentSubAdmin,
      permissions
    );
  }

  async function handleStatusChange(): Promise<void> {
    if (!subAdmin) {
      return;
    }

    const currentSubAdmin =
      subAdmin;

    const trimmedReason =
      reason.trim();

    if (
      deactivating &&
      trimmedReason.length > 500
    ) {
      setValidationError(
        "Status reason must not exceed 500 characters."
      );

      return;
    }

    setValidationError(null);

    await onChangeStatus(
      currentSubAdmin,
      nextStatus,
      trimmedReason || null
    );
  }

  const displayedError =
    validationError || error;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-sub-admin-title"
    >
      <div className="max-h-[calc(100vh-3rem)] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B78A22]">
              Administrator Access
            </p>

            <h2
              id="manage-sub-admin-title"
              className="mt-2 truncate text-xl font-bold text-slate-900"
            >
              Manage {subAdmin.fullName}
            </h2>

            <p className="mt-1 truncate text-sm text-slate-500">
              {subAdmin.email}
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            aria-label="Close manage sub-admin dialog"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                Account status
              </p>

              <div className="mt-2">
                <SubAdminStatusBadge
                  status={subAdmin.status}
                />
              </div>
            </div>

            <p className="max-w-md text-sm leading-6 text-slate-500">
              {subAdmin.status === "ACTIVE"
                ? "This administrator can sign in and use the admin areas assigned below."
                : "This administrator account is deactivated and cannot sign in."}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Permissions
                  </h3>

                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    Changes affect which protected admin sections this account can access.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setPermissions(
                      [...ADMIN_PERMISSIONS]
                    );
                    setValidationError(null);
                  }}
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
                  onClick={() =>
                    setPermissions([])
                  }
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
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#0B2D5C]"
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

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-slate-500">
                {permissions.length}{" "}
                {permissions.length === 1
                  ? "permission"
                  : "permissions"}{" "}
                selected
              </p>

              <button
                type="button"
                disabled={
                  loading ||
                  !permissionsChanged
                }
                onClick={() => {
                  void handleSavePermissions();
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] px-4 text-sm font-bold text-white transition hover:bg-[#123D73] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={15} />

                {loading
                  ? "Saving..."
                  : "Save Permissions"}
              </button>
            </div>
          </div>

          <div
            className={[
              "rounded-2xl border p-4 sm:p-5",
              deactivating
                ? "border-red-200 bg-red-50/50"
                : "border-emerald-200 bg-emerald-50/50",
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              <div
                className={[
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  deactivating
                    ? "bg-red-100 text-red-700"
                    : "bg-emerald-100 text-emerald-700",
                ].join(" ")}
              >
                <Power size={19} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {deactivating
                    ? "Deactivate Administrator"
                    : "Reactivate Administrator"}
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {deactivating
                    ? "Deactivation prevents sign-in and revokes existing refresh tokens."
                    : "Reactivation restores sign-in access using the administrator's assigned permissions."}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="sub-admin-status-reason"
                className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
              >
                Reason
                {!deactivating && " (optional)"}
              </label>

              <textarea
                id="sub-admin-status-reason"
                value={reason}
                maxLength={500}
                disabled={loading}
                onChange={(event) => {
                  setReason(
                    event.target.value
                  );
                  setValidationError(null);
                }}
                rows={3}
                placeholder={
                  deactivating
                    ? "Reason for deactivation..."
                    : "Reason for reactivation..."
                }
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50"
              />

              <p className="mt-1 text-right text-[11px] font-medium text-slate-400">
                {reason.length}/500
              </p>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                void handleStatusChange();
              }}
              className={[
                "mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
                deactivating
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-emerald-600 text-white hover:bg-emerald-700",
              ].join(" ")}
            >
              <Power size={15} />

              {loading
                ? "Updating..."
                : deactivating
                  ? "Deactivate"
                  : "Reactivate"}
            </button>
          </div>

          {displayedError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {displayedError}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-5">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
