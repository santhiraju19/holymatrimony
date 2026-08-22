"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Bell,
  BellOff,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Trash2,
} from "lucide-react";

import Button from "@/components/ui/button";

import {
  getApiErrorMessage,
} from "@/lib/api";

import {
  deleteSavedSearch,
  getSavedSearches,
  setDefaultSavedSearch,
  updateSavedSearchAlerts,
} from "../api/savedSearchApi";

import {
  buildSavedSearchUrl,
} from "../savedSearchUrl";

import type {
  SavedSearch,
  SavedSearchAlertFrequency,
} from "../types";

export default function SavedSearchesPage() {
  const [
    savedSearches,
    setSavedSearches,
  ] = useState<SavedSearch[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    actionId,
    setActionId,
  ] =
    useState<string | null>(
      null
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const loadSavedSearches =
    useCallback(
      async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
          const data =
            await getSavedSearches();

          setSavedSearches(
            data
          );
        } catch (
          caughtError
        ) {
          setError(
            getApiErrorMessage(
              caughtError,
              "Unable to load your saved searches."
            )
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(
    () => {
      void loadSavedSearches();
    },
    [loadSavedSearches]
  );

  async function handleSetDefault(
    savedSearchId: string
  ): Promise<void> {
    if (actionId) {
      return;
    }

    setActionId(
      savedSearchId
    );

    setError(null);

    try {
      const updated =
        await setDefaultSavedSearch(
          savedSearchId
        );

      setSavedSearches(
        (current) =>
          current.map(
            (item) => ({
              ...item,

              defaultSearch:
                item.id ===
                updated.id,
            })
          )
      );
    } catch (
      caughtError
    ) {
      setError(
        getApiErrorMessage(
          caughtError,
          "Unable to update your default search."
        )
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleAlerts(
    savedSearch: SavedSearch,
    enabled: boolean,
    frequency:
      SavedSearchAlertFrequency =
        savedSearch.alertFrequency ??
        "DAILY"
  ): Promise<void> {
    if (actionId) {
      return;
    }

    setActionId(
      savedSearch.id
    );

    setError(null);

    try {
      const updated =
        await updateSavedSearchAlerts(
          savedSearch.id,
          enabled,
          frequency
        );

      setSavedSearches(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              updated.id
                ? updated
                : item
          )
      );
    } catch (
      caughtError
    ) {
      setError(
        getApiErrorMessage(
          caughtError,
          "Unable to update match alerts."
        )
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(
    savedSearch: SavedSearch
  ): Promise<void> {
    if (actionId) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${savedSearch.name}"?`
      );

    if (!confirmed) {
      return;
    }

    setActionId(
      savedSearch.id
    );

    setError(null);

    try {
      await deleteSavedSearch(
        savedSearch.id
      );

      setSavedSearches(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              savedSearch.id
          )
      );
    } catch (
      caughtError
    ) {
      setError(
        getApiErrorMessage(
          caughtError,
          "Unable to delete this saved search."
        )
      );
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="space-y-6 pb-6">

      {/* =====================================================
          Header
          ===================================================== */}

      <section className="relative overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-r from-[#071B36] via-[#0B2D5C] to-[#174A87] px-6 py-7 text-white shadow-[0_14px_38px_rgba(11,45,92,0.16)] sm:px-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-300/15 blur-3xl" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-extrabold text-amber-100">
              <Bookmark size={13} />

              Match Discovery
            </span>

            <h1 className="mt-3 text-2xl font-black tracking-[-0.035em] sm:text-3xl">
              My Saved Searches
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/80">
              Revisit your preferred match criteria and manage alerts for new matching profiles.
            </p>
          </div>

          <Button
            href="/search"
            size="sm"
            leftIcon={
              <Search size={15} />
            }
          >
            New Search
          </Button>
        </div>
      </section>

      {/* =====================================================
          Error
          ===================================================== */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          Loading
          ===================================================== */}

      {loading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({
            length: 4,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-[24px] border border-slate-200 bg-slate-100"
              />
            )
          )}
        </div>

      ) : savedSearches.length ===
        0 ? (

        /* ===================================================
           Empty
           =================================================== */

        <section className="rounded-[26px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0B2D5C]">
            <Bookmark
              size={25}
            />
          </span>

          <h2 className="mt-5 text-xl font-black text-slate-900">
            No saved searches yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Refine your match preferences and save the search so you can return to it anytime.
          </p>

          <div className="mt-6 flex justify-center">
            <Button
              href="/search"
              leftIcon={
                <Search
                  size={16}
                />
              }
            >
              Search Profiles
            </Button>
          </div>
        </section>

      ) : (

        /* ===================================================
           Saved Searches
           =================================================== */

        <div className="grid gap-5 lg:grid-cols-2">
          {savedSearches.map(
            (savedSearch) => {
              const busy =
                actionId ===
                savedSearch.id;

              const searchUrl =
                buildSavedSearchUrl(
                  savedSearch
                );

              return (
                <article
                  key={
                    savedSearch.id
                  }
                  className={[
                    "relative overflow-hidden rounded-[24px] border bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition",
                    savedSearch.defaultSearch
                      ? "border-amber-300 ring-2 ring-amber-100"
                      : "border-slate-200",
                  ].join(" ")}
                >
                  {savedSearch.defaultSearch && (
                    <div className="absolute right-0 top-0 rounded-bl-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white">
                      Default
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-[#0B2D5C]">
                      <Bookmark
                        size={19}
                      />
                    </span>

                    <div className="min-w-0 flex-1 pr-12">
                      <h2 className="truncate text-lg font-black text-[#0B2D5C]">
                        {
                          savedSearch.name
                        }
                      </h2>

                      <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                        <CalendarDays
                          size={12}
                        />

                        Saved{" "}
                        {formatDate(
                          savedSearch.createdAt
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {getSearchChips(
                      savedSearch
                    ).map(
                      (chip) => (
                        <span
                          key={
                            chip
                          }
                          className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600"
                        >
                          {chip}
                        </span>
                      )
                    )}

                    {getSearchChips(
                      savedSearch
                    ).length ===
                      0 && (
                      <span className="text-xs text-slate-400">
                        General profile discovery
                      </span>
                    )}
                  </div>

                  {(savedSearch.aadhaarVerified ||
                    savedSearch.idVerified ||
                    savedSearch.churchVerified) && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                      <ShieldCheck
                        size={14}
                      />

                      Verification preferences included
                    </div>
                  )}

                  {/* =========================================
                      Alerts
                      ========================================= */}

                  <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {savedSearch.alertsEnabled ? (
                          <Bell
                            size={16}
                            className="text-blue-600"
                          />
                        ) : (
                          <BellOff
                            size={16}
                            className="text-slate-400"
                          />
                        )}

                        <div>
                          <p className="text-xs font-black text-slate-700">
                            Match alerts
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {savedSearch.alertsEnabled
                              ? `${formatFrequency(
                                  savedSearch.alertFrequency
                                )} alerts`
                              : "Alerts disabled"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void handleAlerts(
                            savedSearch,
                            !savedSearch.alertsEnabled
                          )
                        }
                        className={[
                          "relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50",
                          savedSearch.alertsEnabled
                            ? "bg-blue-600"
                            : "bg-slate-300",
                        ].join(" ")}
                        aria-label="Toggle match alerts"
                      >
                        <span
                          className={[
                            "absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all",
                            savedSearch.alertsEnabled
                              ? "left-6"
                              : "left-1",
                          ].join(" ")}
                        />
                      </button>
                    </div>

                    {savedSearch.alertsEnabled && (
                      <div className="mt-3 flex gap-2 border-t border-slate-200 pt-3">
                        {(
                          [
                            "DAILY",
                            "WEEKLY",
                          ] as const
                        ).map(
                          (
                            frequency
                          ) => (
                            <button
                              key={
                                frequency
                              }
                              type="button"
                              disabled={
                                busy
                              }
                              onClick={() =>
                                void handleAlerts(
                                  savedSearch,
                                  true,
                                  frequency
                                )
                              }
                              className={[
                                "rounded-lg border px-2.5 py-1.5 text-[10px] font-black transition",
                                savedSearch.alertFrequency ===
                                frequency
                                  ? "border-blue-500 bg-blue-600 text-white"
                                  : "border-slate-200 bg-white text-slate-500 hover:border-blue-200",
                              ].join(
                                " "
                              )}
                            >
                              {formatFrequency(
                                frequency
                              )}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* =========================================
                      Actions
                      ========================================= */}

                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                    <Link
                      href={
                        searchUrl
                      }
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0B2D5C] to-blue-700 px-4 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <Search
                        size={14}
                      />

                      View Matches
                    </Link>

                    {!savedSearch.defaultSearch && (
                      <button
                        type="button"
                        disabled={
                          busy
                        }
                        onClick={() =>
                          void handleSetDefault(
                            savedSearch.id
                          )
                        }
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-black text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                      >
                        <Star
                          size={13}
                        />

                        Set Default
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={
                        busy
                      }
                      onClick={() =>
                        void handleDelete(
                          savedSearch
                        )
                      }
                      className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 text-xs font-black text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2
                          size={13}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2
                          size={13}
                        />
                      )}

                      Delete
                    </button>
                  </div>

                  {savedSearch.defaultSearch && (
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-amber-700">
                      <CheckCircle2
                        size={12}
                      />

                      Your preferred saved search
                    </div>
                  )}
                </article>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

/*
 * ============================================================
 * Helpers
 * ============================================================
 */

function formatDate(
  value: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "recently";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function formatFrequency(
  frequency:
    | SavedSearchAlertFrequency
    | null
): string {
  if (
    frequency === "WEEKLY"
  ) {
    return "Weekly";
  }

  if (
    frequency === "IMMEDIATE"
  ) {
    return "Immediate";
  }

  return "Daily";
}

function getSearchChips(
  savedSearch: SavedSearch
): string[] {
  const chips: string[] =
    [];

  if (
    savedSearch.ageFrom ||
    savedSearch.ageTo
  ) {
    chips.push(
      `Age ${
        savedSearch.ageFrom ??
        "Any"
      }–${
        savedSearch.ageTo ??
        "Any"
      }`
    );
  }

  if (
    savedSearch.heightFrom ||
    savedSearch.heightTo
  ) {
    chips.push(
      `Height ${
        savedSearch.heightFrom ??
        "Any"
      }–${
        savedSearch.heightTo ??
        "Any"
      } cm`
    );
  }

  if (
    savedSearch.religion
  ) {
    chips.push(
      savedSearch.religion
    );
  }

  if (
    savedSearch.denomination
  ) {
    chips.push(
      savedSearch.denomination
    );
  }

  if (
    savedSearch.community
  ) {
    chips.push(
      savedSearch.community
    );
  }

  if (
    savedSearch.motherTongue
  ) {
    chips.push(
      savedSearch.motherTongue
    );
  }

  if (
    savedSearch.profession
  ) {
    chips.push(
      savedSearch.profession
    );
  }

  if (
    savedSearch.city
  ) {
    chips.push(
      savedSearch.city
    );
  } else if (
    savedSearch.state
  ) {
    chips.push(
      savedSearch.state
    );
  } else if (
    savedSearch.country
  ) {
    chips.push(
      savedSearch.country
    );
  }

  if (
    savedSearch.maritalStatus
  ) {
    chips.push(
      savedSearch.maritalStatus
    );
  }

  return chips.slice(
    0,
    7
  );
}