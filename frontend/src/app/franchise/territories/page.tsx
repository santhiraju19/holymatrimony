"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  MapPin,
  RefreshCw,
} from "lucide-react";

import {
  useFranchiseAccess,
} from "@/features/franchise/access/FranchiseAccessProvider";

import {
  getFranchiseTerritories,
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

  const canViewTerritories =
    Boolean(access) &&
    hasPermission(
      "TERRITORIES_VIEW"
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
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {territories.map(
                (territory) => (
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
                  </article>
                )
              )}
            </div>
          </section>
        )}
    </div>
  );
}
