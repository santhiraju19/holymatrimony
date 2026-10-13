"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";

import AdminButton from "@/features/admin/components/ui/AdminButton";
import AdminPageHeader from "@/features/admin/components/ui/AdminPageHeader";
import AdminSectionCard from "@/features/admin/components/ui/AdminSectionCard";

import CreateSubAdminModal from "@/features/admin/admin-users/components/CreateSubAdminModal";
import ManageSubAdminModal from "@/features/admin/admin-users/components/ManageSubAdminModal";
import SubAdminTable from "@/features/admin/admin-users/components/SubAdminTable";

import {
  createSubAdmin,
  getSubAdmins,
  resendSubAdminSetupOtp,
  updateSubAdminPermissions,
  updateSubAdminStatus,
} from "@/features/admin/admin-users/services/adminSubAdminService";

import type {
  AdminPermission,
} from "@/features/admin/access/types";

import type {
  AdminSubAdmin,
  AdminSubAdminPage,
  CreateSubAdminRequest,
  SubAdminStatus,
} from "@/features/admin/admin-users/types/adminSubAdmin";

const PAGE_SIZE = 20;

const EMPTY_PAGE: AdminSubAdminPage = {
  content: [],
  page: 0,
  size: PAGE_SIZE,
  totalElements: 0,
  totalPages: 0,
};

export default function AdminUsersPage() {
  const [
    data,
    setData,
  ] = useState<AdminSubAdminPage>(
    EMPTY_PAGE
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(null);

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState<SubAdminStatus | "">("");

  const [
    page,
    setPage,
  ] = useState(0);

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const [
    createLoading,
    setCreateLoading,
  ] = useState(false);

  const [
    createError,
    setCreateError,
  ] = useState<string | null>(null);

  const [
    selectedSubAdmin,
    setSelectedSubAdmin,
  ] = useState<AdminSubAdmin | null>(
    null
  );

  const [
    manageLoading,
    setManageLoading,
  ] = useState(false);

  const [
    manageError,
    setManageError,
  ] = useState<string | null>(null);

  const [
    busyUserId,
    setBusyUserId,
  ] = useState<string | null>(null);

  const loadSubAdmins =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await getSubAdmins({
            page,
            size: PAGE_SIZE,
            search,
            status,
          });

        setData(result);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load admin users."
        );
      } finally {
        setLoading(false);
      }
    }, [
      page,
      search,
      status,
    ]);

  useEffect(() => {
    void loadSubAdmins();
  }, [loadSubAdmins]);

  function clearMessages(): void {
    setError(null);
    setSuccessMessage(null);
  }

  function handleSearch(
    event: FormEvent<HTMLFormElement>
  ): void {
    event.preventDefault();

    clearMessages();

    const nextSearch =
      searchInput.trim();

    setPage(0);
    setSearch(nextSearch);
  }

  function handleStatusChange(
    nextStatus: SubAdminStatus | ""
  ): void {
    clearMessages();
    setStatus(nextStatus);
    setPage(0);
  }

  function clearFilters(): void {
    clearMessages();
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPage(0);
  }

  async function handleCreate(
    request: CreateSubAdminRequest
  ): Promise<void> {
    setCreateLoading(true);
    setCreateError(null);
    setSuccessMessage(null);

    try {
      const created =
        await createSubAdmin(request);

      setCreateOpen(false);

      setSuccessMessage(
        `${created.fullName} was created successfully. A password setup OTP has been sent.`
      );

      setSearchInput("");
      setSearch("");
      setStatus("");
      setPage(0);

      await loadSubAdmins();
    } catch (createRequestError) {
      setCreateError(
        createRequestError instanceof Error
          ? createRequestError.message
          : "Unable to create admin user."
      );
    } finally {
      setCreateLoading(false);
    }
  }

  function handleManage(
    subAdmin: AdminSubAdmin
  ): void {
    setManageError(null);
    setSuccessMessage(null);
    setSelectedSubAdmin(subAdmin);
  }

  async function handleSavePermissions(
    subAdmin: AdminSubAdmin,
    permissions: AdminPermission[]
  ): Promise<void> {
    setManageLoading(true);
    setManageError(null);
    setSuccessMessage(null);

    try {
      const updated =
        await updateSubAdminPermissions(
          subAdmin.id,
          {
            permissions,
          }
        );

      setSelectedSubAdmin(updated);

      setData(
        (current) => ({
          ...current,
          content:
            current.content.map(
              (item) =>
                item.id === updated.id
                  ? updated
                  : item
            ),
        })
      );

      setSuccessMessage(
        `Permissions updated for ${updated.fullName}.`
      );
    } catch (updateError) {
      setManageError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update admin permissions."
      );
    } finally {
      setManageLoading(false);
    }
  }

  async function handleChangeStatus(
    subAdmin: AdminSubAdmin,
    nextStatus: SubAdminStatus,
    reason: string | null
  ): Promise<void> {
    setManageLoading(true);
    setManageError(null);
    setSuccessMessage(null);

    try {
      const updated =
        await updateSubAdminStatus(
          subAdmin.id,
          {
            status: nextStatus,
            reason,
          }
        );

      setSelectedSubAdmin(updated);

      setSuccessMessage(
        nextStatus === "ACTIVE"
          ? `${updated.fullName} was reactivated successfully.`
          : `${updated.fullName} was deactivated successfully.`
      );

      await loadSubAdmins();
    } catch (statusError) {
      setManageError(
        statusError instanceof Error
          ? statusError.message
          : "Unable to update admin user status."
      );
    } finally {
      setManageLoading(false);
    }
  }

  async function handleResendSetupOtp(
    subAdmin: AdminSubAdmin
  ): Promise<void> {
    if (subAdmin.status !== "ACTIVE") {
      setError(
        "Password setup OTP can only be resent to an active sub-admin."
      );

      return;
    }

    setBusyUserId(subAdmin.id);
    setError(null);
    setSuccessMessage(null);

    try {
      const result =
        await resendSubAdminSetupOtp(
          subAdmin.id
        );

      setSuccessMessage(
        result.message ||
          `Password setup OTP sent to ${subAdmin.email}.`
      );
    } catch (otpError) {
      setError(
        otpError instanceof Error
          ? otpError.message
          : "Unable to resend password setup OTP."
      );
    } finally {
      setBusyUserId(null);
    }
  }

  const hasFilters =
    Boolean(search) ||
    Boolean(status);

  const currentPage =
    data.totalPages > 0
      ? data.page + 1
      : 0;

  return (
    <>
      <div className="space-y-6">
        <AdminPageHeader
          title="Admin Users"
          description="Create and manage sub-admin accounts, permissions, access status, and password setup."
          actions={
            <AdminButton
              icon={<UserPlus size={16} />}
              onClick={() => {
                setCreateError(null);
                setSuccessMessage(null);
                setCreateOpen(true);
              }}
            >
              Create Sub-admin
            </AdminButton>
          }
        />

        {successMessage && (
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            <span>
              {successMessage}
            </span>

            <button
              type="button"
              aria-label="Dismiss success message"
              onClick={() =>
                setSuccessMessage(null)
              }
              className="shrink-0 rounded-lg p-1 text-emerald-700 transition hover:bg-emerald-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <AdminSectionCard
          title="Search & Filters"
          description="Find administrators by name or email and filter by account status."
          icon={Filter}
        >
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 lg:flex-row lg:items-end"
          >
            <div className="min-w-0 flex-1">
              <label
                htmlFor="admin-user-search"
                className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
              >
                Search
              </label>

              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="admin-user-search"
                  type="search"
                  value={searchInput}
                  onChange={(event) =>
                    setSearchInput(
                      event.target.value
                    )
                  }
                  placeholder="Search by name or email"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>

            <div className="w-full lg:w-52">
              <label
                htmlFor="admin-user-status"
                className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
              >
                Status
              </label>

              <select
                id="admin-user-status"
                value={status}
                onChange={(event) =>
                  handleStatusChange(
                    event.target.value as
                      | SubAdminStatus
                      | ""
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-50"
              >
                <option value="">
                  All statuses
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="DEACTIVATED">
                  Deactivated
                </option>
              </select>
            </div>

            <div className="flex gap-2">
              <AdminButton
                type="submit"
                icon={<Search size={16} />}
              >
                Search
              </AdminButton>

              {hasFilters && (
                <AdminButton
                  type="button"
                  variant="secondary"
                  icon={<X size={16} />}
                  onClick={clearFilters}
                >
                  Clear
                </AdminButton>
              )}

              <AdminButton
                type="button"
                variant="secondary"
                icon={<RefreshCw size={16} />}
                disabled={loading}
                onClick={() => {
                  clearMessages();
                  void loadSubAdmins();
                }}
              >
                Refresh
              </AdminButton>
            </div>
          </form>
        </AdminSectionCard>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                void loadSubAdmins();
              }}
              className="mt-3 text-sm font-bold text-red-700 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="text-center">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-[#0B2D5C]" />

              <p className="mt-3 text-sm font-semibold text-slate-500">
                Loading admin users...
              </p>
            </div>
          </div>
        ) : (
          <SubAdminTable
            subAdmins={data.content}
            busyUserId={busyUserId}
            onManage={handleManage}
            onResendSetupOtp={(subAdmin) => {
              void handleResendSetupOtp(
                subAdmin
              );
            }}
          />
        )}

        {!loading &&
          data.totalPages > 1 && (
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-500">
                Page{" "}
                <span className="font-bold text-slate-800">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-800">
                  {data.totalPages}
                </span>
                {" · "}
                {data.totalElements.toLocaleString(
                  "en-IN"
                )}{" "}
                total
              </p>

              <div className="flex gap-2">
                <AdminButton
                  type="button"
                  variant="secondary"
                  disabled={page <= 0}
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          0,
                          current - 1
                        )
                    )
                  }
                >
                  Previous
                </AdminButton>

                <AdminButton
                  type="button"
                  variant="secondary"
                  disabled={
                    page >=
                    data.totalPages - 1
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        current + 1
                    )
                  }
                >
                  Next
                </AdminButton>
              </div>
            </div>
          )}
      </div>

      <CreateSubAdminModal
        open={createOpen}
        loading={createLoading}
        error={createError}
        onClose={() => {
          if (!createLoading) {
            setCreateOpen(false);
            setCreateError(null);
          }
        }}
        onCreate={handleCreate}
      />

      <ManageSubAdminModal
        open={Boolean(
          selectedSubAdmin
        )}
        subAdmin={selectedSubAdmin}
        loading={manageLoading}
        error={manageError}
        onClose={() => {
          if (!manageLoading) {
            setSelectedSubAdmin(null);
            setManageError(null);
          }
        }}
        onSavePermissions={
          handleSavePermissions
        }
        onChangeStatus={
          handleChangeStatus
        }
      />
    </>
  );
}
