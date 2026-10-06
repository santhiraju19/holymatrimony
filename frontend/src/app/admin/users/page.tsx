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
  Users,
  X,
} from "lucide-react";

import AdminButton from "@/features/admin/components/ui/AdminButton";
import AdminPageHeader from "@/features/admin/components/ui/AdminPageHeader";
import AdminSectionCard from "@/features/admin/components/ui/AdminSectionCard";

import {
  AdminUserTable,
} from "@/features/admin/users/components/AdminUserTable";

import {
  getAdminUsers,
} from "@/features/admin/users/services/adminUserService";

import type {
  AdminUserPage,
  UserStatus,
} from "@/features/admin/users/types/adminUser";

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const [
    data,
    setData,
  ] =
    useState<AdminUserPage | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    searchInput,
    setSearchInput,
  ] =
    useState("");

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    status,
    setStatus,
  ] =
    useState<UserStatus | "">(
      ""
    );

  const [
    page,
    setPage,
  ] =
    useState(0);

  const loadUsers =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError(null);

          const response =
            await getAdminUsers({
              page,
              size: PAGE_SIZE,
              search,
              status,
            });

          setData(response);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load users."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        page,
        search,
        status,
      ]
    );

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function handleSearch(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setPage(0);

    setSearch(
      searchInput.trim()
    );
  }

  function handleStatusChange(
    value: string
  ) {
    setPage(0);

    setStatus(
      value as
        | UserStatus
        | ""
    );
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPage(0);
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <AdminPageHeader
        eyebrow="Member Administration"
        title="User Management"
        description="Search, review and manage Holy Matrimony member accounts, access status and verification state."
        actions={
          <div className="flex min-w-[150px] items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#0B2D5C] shadow-sm">
              <Users size={18} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-500">
                Registered Users
              </p>

              <p className="text-xl font-black leading-tight text-[#0B2D5C]">
                {data?.totalElements ?? "—"}
              </p>
            </div>
          </div>
        }
      />

      <div className="mt-6">
        <AdminSectionCard
          title="Search & Filters"
          description="Find members by name, email or mobile number and narrow results by account status."
          icon={Filter}
          actions={
            <AdminButton
              type="button"
              onClick={() => void loadUsers()}
              icon={<RefreshCw size={16} />}
              disabled={loading}
            >
              Refresh
            </AdminButton>
          }
        >
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
            <form
              onSubmit={handleSearch}
              className="min-w-0 flex-1"
            >
              <label
                htmlFor="admin-user-search"
                className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
              >
                Search members
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="admin-user-search"
                    value={searchInput}
                    onChange={(event) =>
                      setSearchInput(event.target.value)
                    }
                    placeholder="Name, email or mobile..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <AdminButton
                  type="submit"
                  variant="primary"
                  icon={<Search size={16} />}
                  className="w-full sm:w-auto"
                >
                  Search
                </AdminButton>
              </div>
            </form>

            <div className="w-full xl:w-[220px]">
              <label
                htmlFor="admin-user-status"
                className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
              >
                Account status
              </label>

              <select
                id="admin-user-status"
                value={status}
                onChange={(event) =>
                  handleStatusChange(event.target.value)
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-50"
              >
                <option value="">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="BLOCKED">Blocked</option>
                <option value="DEACTIVATED">Deactivated</option>
              </select>
            </div>

            {(search || status) && (
              <AdminButton
                type="button"
                onClick={clearFilters}
                icon={<X size={16} />}
                className="w-full xl:w-auto"
              >
                Clear filters
              </AdminButton>
            )}
          </div>
        </AdminSectionCard>
      </div>

      <div className="mt-6">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
            <p className="font-bold text-red-700">
              Unable to load users
            </p>

            <p className="mt-1 text-sm leading-6 text-red-600">
              {error}
            </p>

            <AdminButton
              type="button"
              variant="danger"
              onClick={() => void loadUsers()}
              icon={<RefreshCw size={16} />}
              className="mt-4"
            >
              Retry
            </AdminButton>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#0B2D5C]" />

            <p className="mt-4 text-sm font-semibold text-slate-500">
              Loading users...
            </p>
          </div>
        ) : (
          data && (
            <>
              <AdminUserTable users={data.content} />

              <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Page {data.page + 1} of{" "}
                    {Math.max(data.totalPages, 1)}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {data.totalElements} registered{" "}
                    {data.totalElements === 1 ? "user" : "users"}
                  </p>
                </div>

                <div className="flex w-full gap-2 sm:w-auto">
                  <AdminButton
                    type="button"
                    disabled={data.first}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(0, current - 1)
                      )
                    }
                    className="flex-1 sm:flex-none"
                  >
                    Previous
                  </AdminButton>

                  <AdminButton
                    type="button"
                    variant="primary"
                    disabled={data.last}
                    onClick={() =>
                      setPage((current) => current + 1)
                    }
                    className="flex-1 sm:flex-none"
                  >
                    Next
                  </AdminButton>
                </div>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}