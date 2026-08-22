"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bell,
  BookmarkPlus,
  CheckCircle2,
  Loader2,
  Star,
  X,
} from "lucide-react";

import Button from "@/components/ui/button";
import Input from "@/components/ui/Input";

import {
  getApiErrorMessage,
} from "@/lib/api";

import {
  createSavedSearch,
} from "../api/savedSearchApi";

import {
  filtersToSavedSearchRequest,
} from "../types";

import type {
  BrowseSearchFilters,
} from "@/features/browse/types";

import type {
  SavedSearch,
  SavedSearchAlertFrequency,
} from "../types";

interface SaveSearchModalProps {
  open: boolean;

  filters: BrowseSearchFilters;

  onClose: () => void;

  onSaved?: (
    savedSearch: SavedSearch
  ) => void;
}

export default function SaveSearchModal({
  open,
  filters,
  onClose,
  onSaved,
}: SaveSearchModalProps) {
  const [
    name,
    setName,
  ] = useState("");

  const [
    defaultSearch,
    setDefaultSearch,
  ] = useState(false);

  const [
    alertsEnabled,
    setAlertsEnabled,
  ] = useState(false);

  const [
    alertFrequency,
    setAlertFrequency,
  ] =
    useState<SavedSearchAlertFrequency>(
      "DAILY"
    );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    success,
    setSuccess,
  ] = useState(false);

  const activeFilterCount =
    useMemo(
      () =>
        Object.entries(
          filters
        ).filter(
          ([key, value]) =>
            key !== "sort" &&
            value !== ""
        ).length,
      [filters]
    );

  useEffect(
    () => {
      if (!open) {
        return;
      }

      setName("");
      setDefaultSearch(false);
      setAlertsEnabled(false);
      setAlertFrequency("DAILY");
      setSaving(false);
      setError(null);
      setSuccess(false);
    },
    [open]
  );

  if (!open) {
    return null;
  }

  async function handleSave():
    Promise<void> {
    const cleanedName =
      name.trim();

    if (!cleanedName) {
      setError(
        "Please enter a name for this search."
      );

      return;
    }

    setSaving(true);
    setError(null);

    try {
      const request =
        filtersToSavedSearchRequest(
          filters,
          {
            name:
              cleanedName,

            defaultSearch,

            alertsEnabled,

            alertFrequency,
          }
        );

      const savedSearch =
        await createSavedSearch(
          request
        );

      setSuccess(true);

      onSaved?.(
        savedSearch
      );

      window.setTimeout(
        () => {
          onClose();
        },
        700
      );
    } catch (
      caughtError
    ) {
      setError(
        getApiErrorMessage(
          caughtError,
          "Unable to save this search."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close save search dialog"
        onClick={
          saving
            ? undefined
            : onClose
        }
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
      />

      <section className="relative z-10 w-full max-w-xl overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_30px_100px_rgba(2,12,27,0.30)]">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#071B36] via-[#0B2D5C] to-[#174A87] px-6 py-6 text-white">
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-300/15 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-extrabold text-amber-100">
                <BookmarkPlus
                  size={13}
                />

                Saved Search
              </span>

              <h2 className="mt-3 text-2xl font-black tracking-[-0.03em]">
                Save these preferences
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-blue-100/80">
                Save your current filters so you can return to the same match criteria anytime.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3">
            <p className="text-xs font-bold text-blue-800">
              Current search
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {activeFilterCount ===
              0
                ? "No optional filters are currently selected."
                : `${activeFilterCount} ${
                    activeFilterCount ===
                    1
                      ? "filter"
                      : "filters"
                  } selected.`}
            </p>
          </div>

          <div>
            <label
              htmlFor="saved-search-name"
              className="mb-2 block text-sm font-black text-slate-800"
            >
              Search name
            </label>

            <Input
              id="saved-search-name"
              value={name}
              maxLength={100}
              placeholder="Example: Hyderabad Telugu Match"
              disabled={saving}
              onChange={(
                event
              ) => {
                setName(
                  event.target.value
                );

                if (error) {
                  setError(null);
                }
              }}
            />

            <p className="mt-1.5 text-[11px] text-slate-400">
              Choose a name you will recognize later.
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              setDefaultSearch(
                (current) =>
                  !current
              )
            }
            className={[
              "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition",
              defaultSearch
                ? "border-amber-300 bg-amber-50"
                : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30",
            ].join(" ")}
          >
            <span
              className={[
                "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                defaultSearch
                  ? "bg-amber-400 text-white"
                  : "bg-slate-100 text-slate-500",
              ].join(" ")}
            >
              <Star
                size={17}
                fill={
                  defaultSearch
                    ? "currentColor"
                    : "none"
                }
              />
            </span>

            <span className="min-w-0">
              <span className="block text-sm font-black text-slate-800">
                Make this my default search
              </span>

              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Keep this as your preferred saved search for faster access.
              </span>
            </span>
          </button>

          <div
            className={[
              "rounded-2xl border p-4 transition",
              alertsEnabled
                ? "border-blue-300 bg-blue-50/60"
                : "border-slate-200 bg-white",
            ].join(" ")}
          >
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                setAlertsEnabled(
                  (current) =>
                    !current
                )
              }
              className="flex w-full items-start gap-3 text-left"
            >
              <span
                className={[
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                  alertsEnabled
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-500",
                ].join(" ")}
              >
                <Bell
                  size={17}
                />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-slate-800">
                  Match alerts
                </span>

                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Receive alerts when new profiles match this saved search.
                </span>
              </span>

              <span
                className={[
                  "relative mt-1 h-6 w-11 shrink-0 rounded-full transition",
                  alertsEnabled
                    ? "bg-blue-600"
                    : "bg-slate-300",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all",
                    alertsEnabled
                      ? "left-6"
                      : "left-1",
                  ].join(" ")}
                />
              </span>
            </button>

            {alertsEnabled && (
              <div className="mt-4 border-t border-blue-100 pt-4">
                <p className="text-xs font-black text-slate-700">
                  Alert frequency
                </p>

                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      "DAILY",
                      "WEEKLY",
                    ] as const
                  ).map(
                    (
                      frequency
                    ) => {
                      const active =
                        alertFrequency ===
                        frequency;

                      return (
                        <button
                          key={
                            frequency
                          }
                          type="button"
                          disabled={
                            saving
                          }
                          onClick={() =>
                            setAlertFrequency(
                              frequency
                            )
                          }
                          className={[
                            "rounded-xl border px-3 py-2.5 text-xs font-extrabold transition",
                            active
                              ? "border-blue-500 bg-blue-600 text-white"
                              : "border-slate-200 bg-white text-slate-600 hover:border-blue-200",
                          ].join(
                            " "
                          )}
                        >
                          {frequency ===
                          "DAILY"
                            ? "Daily"
                            : "Weekly"}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              <CheckCircle2
                size={17}
              />

              Search saved successfully.
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              disabled={saving}
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              disabled={
                saving ||
                !name.trim()
              }
              onClick={() =>
                void handleSave()
              }
              leftIcon={
                saving ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <BookmarkPlus
                    size={16}
                  />
                )
              }
            >
              {saving
                ? "Saving..."
                : "Save Search"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}