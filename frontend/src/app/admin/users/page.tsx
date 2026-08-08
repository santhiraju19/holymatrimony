"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

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
      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#B78A22]">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            User Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Search, review and manage
            Holy Matrimony members.
          </p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
            Registered Users
          </p>

          <p className="mt-1 text-2xl font-bold text-[#0B2D5C]">
            {data?.totalElements ??
              "—"}
          </p>
        </div>
      </div>

      {/* Filters */}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          {/* Search */}

          <form
            onSubmit={
              handleSearch
            }
            className="flex flex-1 gap-2"
          >
            <input
              value={
                searchInput
              }
              onChange={(
                event
              ) =>
                setSearchInput(
                  event.target
                    .value
                )
              }
              placeholder="Search name, email or mobile..."
              className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            <button
              type="submit"
              className="h-11 rounded-xl bg-[#0B2D5C] px-5 text-sm font-semibold text-white transition hover:bg-[#123C73]"
            >
              Search
            </button>
          </form>

          {/* Status */}

          <select
            value={status}
            onChange={(
              event
            ) =>
              handleStatusChange(
                event.target
                  .value
              )
            }
            className="h-11 min-w-[180px] rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">
              All statuses
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="SUSPENDED">
              Suspended
            </option>

            <option value="BLOCKED">
              Blocked
            </option>

            <option value="DEACTIVATED">
              Deactivated
            </option>
          </select>

          {/* Clear */}

          {(search ||
            status) && (
            <button
              type="button"
              onClick={
                clearFilters
              }
              className="h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error */}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-700">
            Unable to load users
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadUsers()
            }
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#0B2D5C]" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading users...
          </p>
        </div>
      ) : (
        data && (
          <>
            {/* Users */}

            <AdminUserTable
              users={
                data.content
              }
            />

            {/* Pagination */}

            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page{" "}
                <span className="font-semibold text-slate-900">
                  {data.page +
                    1}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">
                  {Math.max(
                    data.totalPages,
                    1
                  )}
                </span>

                {" · "}

                {
                  data.totalElements
                }{" "}
                users
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={
                    data.first
                  }
                  onClick={() =>
                    setPage(
                      (
                        current
                      ) =>
                        Math.max(
                          0,
                          current -
                            1
                        )
                    )
                  }
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    data.last
                  }
                  onClick={() =>
                    setPage(
                      (
                        current
                      ) =>
                        current +
                        1
                    )
                  }
                  className="rounded-lg bg-[#0B2D5C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#123C73] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}