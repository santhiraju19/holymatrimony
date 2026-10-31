"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  MapPin,
  RefreshCw,
  X,
} from "lucide-react";

import {
  useFranchiseAccess,
} from "@/features/franchise/access/FranchiseAccessProvider";

import {
  getFranchiseTerritories,
  updateFranchiseTerritory,
} from "@/features/franchise/api/franchiseApi";

import type {
  FranchiseTerritory,
  FranchiseTerritoryType,
} from "@/features/franchise/types/franchiseTerritory";

import {
  getApiErrorMessage,
} from "@/lib/api";

function formatTerritoryType(
  territoryType: FranchiseTerritoryType
): string {
  return territoryType
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

export default function FranchiseTerritoriesPage() {
  const {
    access,
    hasPermission,
  } = useFranchiseAccess();

  const [
    territories,
    setTerritories,
  ] = useState<FranchiseTerritory[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    editingTerritoryId,
    setEditingTerritoryId,
  ] = useState<string | null>(null);

  const [
    editName,
    setEditName,
  ] = useState("");

  const [
    editCoverageDescription,
    setEditCoverageDescription,
  ] = useState("");

  const [
    savingTerritoryId,
    setSavingTerritoryId,
  ] = useState<string | null>(null);

  const [
    updateError,
    setUpdateError,
  ] = useState<string | null>(null);

  const [
    successTerritoryId,
    setSuccessTerritoryId,
  ] = useState<string | null>(null);

  const canViewTerritories =
    Boolean(access) &&
    hasPermission(
      "TERRITORIES_VIEW"
    );

  const canManageTerritories =
    Boolean(access) &&
    hasPermission(
      "TERRITORIES_MANAGE"
    );

  const loadTerritories =
    useCallback(async () => {
      if (!canViewTerritories) {
        setTerritories([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await getFranchiseTerritories();

        setTerritories(response);
      } catch (loadError) {
        setTerritories([]);

        setError(
          getApiErrorMessage(
            loadError,
            "Unable to load your assigned territories."
          )
        );
      } finally {
        setLoading(false);
      }
    }, [
      canViewTerritories,
    ]);

  useEffect(() => {
    void loadTerritories();
  }, [
    loadTerritories,
  ]);

  function beginEditing(
    territory: FranchiseTerritory
  ) {
    if (!canManageTerritories) {
      return;
    }

    setEditingTerritoryId(
      territory.territoryId
    );

    setEditName(
      territory.name
    );

    setEditCoverageDescription(
      territory.coverageDescription ?? ""
    );

    setUpdateError(null);
    setSuccessTerritoryId(null);
  }

  function cancelEditing() {
    if (savingTerritoryId) {
      return;
    }

    setEditingTerritoryId(null);
    setEditName("");
    setEditCoverageDescription("");
    setUpdateError(null);
  }

  async function saveTerritory(
    territory: FranchiseTerritory
  ) {
    if (
      !canManageTerritories ||
      savingTerritoryId
    ) {
      return;
    }

    const normalizedName =
      editName.trim();

    if (!normalizedName) {
      setUpdateError(
        "Territory name is required."
      );
      return;
    }

    if (normalizedName.length > 180) {
      setUpdateError(
        "Territory name must not exceed 180 characters."
      );
      return;
    }

    if (
      editCoverageDescription.length >
      2000
    ) {
      setUpdateError(
        "Coverage description must not exceed 2000 characters."
      );
      return;
    }

    setSavingTerritoryId(
      territory.territoryId
    );

    setUpdateError(null);
    setSuccessTerritoryId(null);

    try {
      const updatedTerritory =
        await updateFranchiseTerritory(
          territory.territoryId,
          {
            name: normalizedName,
            coverageDescription:
              editCoverageDescription.trim() ||
              null,
          }
        );

      setTerritories(
        (currentTerritories) =>
          currentTerritories.map(
            (currentTerritory) =>
              currentTerritory.territoryId ===
              updatedTerritory.territoryId
                ? updatedTerritory
                : currentTerritory
          )
      );

      setEditingTerritoryId(null);
      setEditName("");
      setEditCoverageDescription("");

      setSuccessTerritoryId(
        updatedTerritory.territoryId
      );
    } catch (saveError) {
      setUpdateError(
        getApiErrorMessage(
          saveError,
          "Unable to update the territory."
        )
      );
    } finally {
      setSavingTerritoryId(null);
    }
  }

  if (
    !access ||
    !canViewTerritories
  ) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-lg font-bold text-amber-900">
          Territory Access Restricted
        </h1>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          Your franchise account does not currently have permission to view territories.
        </p>
      </section>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B2D5C] to-[#123D73] p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Franchise Territory Portal
            </p>

            <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
              Assigned Territories
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              View the active territories available within your authorized district allocation.
              {canManageTerritories
                ? " You can also update permitted operational territory details."
                : ""}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-200">
              District
            </p>

            <p className="mt-1 font-bold text-white">
              {access.districtName}
            </p>

            <p className="mt-1 text-xs text-blue-200">
              LGD {access.districtLgdCode}
            </p>
          </div>
        </div>
      </section>

      {loading && (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-center gap-3 text-slate-600">
            <RefreshCw
              className="h-5 w-5 animate-spin"
              aria-hidden="true"
            />

            <p className="text-sm font-medium">
              Loading assigned territories...
            </p>
          </div>
        </section>
      )}

      {!loading && error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
              aria-hidden="true"
            />

            <div>
              <h2 className="font-bold text-red-900">
                Unable to Load Territories
              </h2>

              <p className="mt-2 text-sm leading-6 text-red-800">
                {error}
              </p>

              <button
                type="button"
                onClick={() => {
                  void loadTerritories();
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
              >
                <RefreshCw
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Try Again
              </button>
            </div>
          </div>
        </section>
      )}

      {!loading &&
        !error &&
        territories.length === 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <MapPin
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No Active Territories
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              There are currently no active territories available within your authorized district allocation.
            </p>
          </section>
        )}

      {!loading &&
        !error &&
        territories.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Territory Coverage
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {territories.length} active{" "}
                  {territories.length === 1
                    ? "territory"
                    : "territories"}
                </p>
              </div>

              {canManageTerritories && (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  Management enabled
                </span>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {territories.map(
                (territory) => {
                  const isEditing =
                    editingTerritoryId ===
                    territory.territoryId;

                  const isSaving =
                    savingTerritoryId ===
                    territory.territoryId;

                  const wasUpdated =
                    successTerritoryId ===
                    territory.territoryId;

                  return (
                    <article
                      key={
                        territory.territoryId
                      }
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0B2D5C]">
                          <MapPin
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </div>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {formatTerritoryType(
                            territory.territoryType
                          )}
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="mt-5">
                          <label
                            htmlFor={`territory-name-${territory.territoryId}`}
                            className="block text-xs font-bold uppercase tracking-wide text-slate-500"
                          >
                            Territory Name
                          </label>

                          <input
                            id={`territory-name-${territory.territoryId}`}
                            type="text"
                            value={editName}
                            maxLength={180}
                            disabled={isSaving}
                            onChange={(event) => {
                              setEditName(
                                event.target.value
                              );
                              setUpdateError(null);
                            }}
                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                          />

                          <p className="mt-1 text-right text-xs text-slate-400">
                            {editName.length}/180
                          </p>

                          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                              Territory Code
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-700">
                              {territory.territoryCode}
                            </p>

                            <p className="mt-2 text-xs text-slate-400">
                              Territory code and type cannot be changed by franchise users.
                            </p>
                          </div>

                          <div className="mt-4">
                            <label
                              htmlFor={`territory-coverage-${territory.territoryId}`}
                              className="block text-xs font-bold uppercase tracking-wide text-slate-500"
                            >
                              Coverage Description
                            </label>

                            <textarea
                              id={`territory-coverage-${territory.territoryId}`}
                              rows={5}
                              value={
                                editCoverageDescription
                              }
                              maxLength={2000}
                              disabled={isSaving}
                              onChange={(event) => {
                                setEditCoverageDescription(
                                  event.target.value
                                );
                                setUpdateError(null);
                              }}
                              placeholder="Describe the operational coverage for this territory..."
                              className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                            />

                            <p className="mt-1 text-right text-xs text-slate-400">
                              {
                                editCoverageDescription.length
                              }
                              /2000
                            </p>
                          </div>

                          {updateError && (
                            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                              <AlertCircle
                                className="mt-0.5 h-4 w-4 shrink-0"
                                aria-hidden="true"
                              />

                              <span>
                                {updateError}
                              </span>
                            </div>
                          )}

                          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                            <button
                              type="button"
                              disabled={
                                isSaving
                              }
                              onClick={() => {
                                void saveTerritory(
                                  territory
                                );
                              }}
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] px-4 text-sm font-bold text-white transition hover:bg-[#123D73] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isSaving ? (
                                <RefreshCw
                                  className="h-4 w-4 animate-spin"
                                  aria-hidden="true"
                                />
                              ) : (
                                <CheckCircle2
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              )}

                              {isSaving
                                ? "Saving..."
                                : "Save Changes"}
                            </button>

                            <button
                              type="button"
                              disabled={
                                isSaving
                              }
                              onClick={
                                cancelEditing
                              }
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <X
                                className="h-4 w-4"
                                aria-hidden="true"
                              />

                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="mt-5 text-lg font-bold text-slate-900">
                            {territory.name}
                          </h3>

                          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            {
                              territory.territoryCode
                            }
                          </p>

                          {territory.coverageDescription ? (
                            <p className="mt-4 text-sm leading-6 text-slate-600">
                              {
                                territory.coverageDescription
                              }
                            </p>
                          ) : (
                            <p className="mt-4 text-sm italic leading-6 text-slate-400">
                              No coverage description available.
                            </p>
                          )}

                          {wasUpdated && (
                            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                              <CheckCircle2
                                className="h-4 w-4 shrink-0"
                                aria-hidden="true"
                              />

                              Territory updated successfully.
                            </div>
                          )}

                          {canManageTerritories && (
                            <button
                              type="button"
                              disabled={
                                Boolean(
                                  savingTerritoryId
                                )
                              }
                              onClick={() => {
                                beginEditing(
                                  territory
                                );
                              }}
                              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#0B2D5C] transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Edit3
                                className="h-4 w-4"
                                aria-hidden="true"
                              />

                              Edit Territory
                            </button>
                          )}
                        </>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          </section>
        )}
    </div>
  );
}
