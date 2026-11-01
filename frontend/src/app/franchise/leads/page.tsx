"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Plus,
  RefreshCw,
  UserRound,
  X,
} from "lucide-react";

import {
  useFranchiseAccess,
} from "@/features/franchise/access/FranchiseAccessProvider";

import {
  createFranchiseLead,
  getFranchiseLeads,
  getFranchiseTerritories,
  updateFranchiseLead,
} from "@/features/franchise/api/franchiseApi";

import type {
  FranchiseLead,
  FranchiseLeadSource,
  FranchiseLeadStatus,
} from "@/features/franchise/types/franchiseLead";

import type {
  FranchiseTerritory,
} from "@/features/franchise/types/franchiseTerritory";

import {
  getApiErrorMessage,
} from "@/lib/api";

interface LeadFormState {
  fullName: string;
  mobile: string;
  email: string;
  source: FranchiseLeadSource;
  status: FranchiseLeadStatus;
  notes: string;
  territoryId: string;
}

const INITIAL_FORM: LeadFormState = {
  fullName: "",
  mobile: "",
  email: "",
  source: "WALK_IN",
  status: "NEW",
  notes: "",
  territoryId: "",
};

const SOURCE_OPTIONS: Array<{
  value: FranchiseLeadSource;
  label: string;
}> = [
  { value: "WALK_IN", label: "Walk In" },
  { value: "PHONE", label: "Phone" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "WEBSITE", label: "Website" },
  { value: "SOCIAL_MEDIA", label: "Social Media" },
  { value: "REFERRAL", label: "Referral" },
  { value: "CHURCH", label: "Church" },
  { value: "EVENT", label: "Event" },
  { value: "OTHER", label: "Other" },
];

const STATUS_OPTIONS: Array<{
  value: FranchiseLeadStatus;
  label: string;
}> = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "FOLLOW_UP", label: "Follow Up" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "CONVERTED", label: "Converted" },
  { value: "LOST", label: "Lost" },
];

function sourceLabel(
  source: FranchiseLeadSource
): string {
  return (
    SOURCE_OPTIONS.find(
      (option) => option.value === source
    )?.label ?? source
  );
}

function statusLabel(
  status: FranchiseLeadStatus
): string {
  return (
    STATUS_OPTIONS.find(
      (option) => option.value === status
    )?.label ?? status
  );
}

function formatDateTime(
  value: string
): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(parsed);
}

function statusClassName(
  status: FranchiseLeadStatus
): string {
  switch (status) {
    case "NEW":
      return "bg-blue-50 text-blue-700";
    case "CONTACTED":
      return "bg-cyan-50 text-cyan-700";
    case "FOLLOW_UP":
      return "bg-amber-50 text-amber-700";
    case "QUALIFIED":
      return "bg-violet-50 text-violet-700";
    case "CONVERTED":
      return "bg-emerald-50 text-emerald-700";
    case "LOST":
      return "bg-slate-100 text-slate-600";
  }
}

export default function FranchiseLeadsPage() {
  const {
    access,
    hasPermission,
    loading: accessLoading,
    error: accessError,
    refreshAccess,
  } = useFranchiseAccess();

  const canViewLeads =
    hasPermission("LEADS_VIEW");

  const canManageLeads =
    hasPermission("LEADS_MANAGE");

  const canViewTerritories =
    hasPermission("TERRITORIES_VIEW");

  const [leads, setLeads] =
    useState<FranchiseLead[]>([]);

  const [territories, setTerritories] =
    useState<FranchiseTerritory[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [territoryError, setTerritoryError] =
    useState<string | null>(null);

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingLeadId, setEditingLeadId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<LeadFormState>(
      INITIAL_FORM
    );

  const [formError, setFormError] =
    useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const loadLeads =
    useCallback(async () => {
      if (!canViewLeads) {
        setLeads([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await getFranchiseLeads();

        setLeads(response);
      } catch (loadError) {
        setLeads([]);

        setError(
          getApiErrorMessage(
            loadError,
            "Unable to load leads. Please try again."
          )
        );
      } finally {
        setLoading(false);
      }
    }, [
      canViewLeads,
    ]);

  const loadTerritories =
    useCallback(async () => {
      if (
        !canManageLeads ||
        !canViewTerritories
      ) {
        setTerritories([]);
        setTerritoryError(null);
        return;
      }

      setTerritoryError(null);

      try {
        const response =
          await getFranchiseTerritories();

        setTerritories(response);
      } catch (loadError) {
        setTerritories([]);

        setTerritoryError(
          getApiErrorMessage(
            loadError,
            "Territories could not be loaded. Leads can still be saved without a territory."
          )
        );
      }
    }, [
      canManageLeads,
      canViewTerritories,
    ]);

  useEffect(() => {
    if (
      accessLoading ||
      accessError ||
      !canViewLeads
    ) {
      return;
    }

    void loadLeads();
  }, [
    accessLoading,
    accessError,
    canViewLeads,
    loadLeads,
  ]);

  useEffect(() => {
    if (
      accessLoading ||
      accessError ||
      !canManageLeads
    ) {
      return;
    }

    void loadTerritories();
  }, [
    accessLoading,
    accessError,
    canManageLeads,
    loadTerritories,
  ]);

  const newLeadCount =
    useMemo(
      () =>
        leads.filter(
          (lead) =>
            lead.status === "NEW"
        ).length,
      [leads]
    );

  const followUpCount =
    useMemo(
      () =>
        leads.filter(
          (lead) =>
            lead.status === "FOLLOW_UP"
        ).length,
      [leads]
    );

  const convertedCount =
    useMemo(
      () =>
        leads.filter(
          (lead) =>
            lead.status === "CONVERTED"
        ).length,
      [leads]
    );

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditingLeadId(null);
    setFormError(null);
  }

  function openCreateForm() {
    if (!canManageLeads) {
      return;
    }

    resetForm();
    setSuccessMessage(null);
    setFormOpen(true);
  }

  function openEditForm(
    lead: FranchiseLead
  ) {
    if (!canManageLeads) {
      return;
    }

    setEditingLeadId(lead.id);

    setForm({
      fullName: lead.fullName,
      mobile: lead.mobile,
      email: lead.email ?? "",
      source: lead.source,
      status: lead.status,
      notes: lead.notes ?? "",
      territoryId:
        lead.territoryId ?? "",
    });

    setFormError(null);
    setSuccessMessage(null);
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setFormOpen(false);
    resetForm();
  }

  function updateForm<K extends keyof LeadFormState>(
    field: K,
    value: LeadFormState[K]
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );

    setFormError(null);
  }

  async function submitLead(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !canManageLeads ||
      saving
    ) {
      return;
    }

    const fullName =
      form.fullName.trim();

    const mobile =
      form.mobile.trim();

    const email =
      form.email.trim();

    const notes =
      form.notes.trim();

    if (!fullName) {
      setFormError(
        "Lead name is required."
      );
      return;
    }

    if (fullName.length > 150) {
      setFormError(
        "Lead name must not exceed 150 characters."
      );
      return;
    }

    if (!mobile) {
      setFormError(
        "Mobile number is required."
      );
      return;
    }

    if (mobile.length > 30) {
      setFormError(
        "Mobile number must not exceed 30 characters."
      );
      return;
    }

    if (email.length > 180) {
      setFormError(
        "Email must not exceed 180 characters."
      );
      return;
    }

    if (notes.length > 5000) {
      setFormError(
        "Notes must not exceed 5000 characters."
      );
      return;
    }

    setSaving(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      if (editingLeadId) {
        const updated =
          await updateFranchiseLead(
            editingLeadId,
            {
              fullName,
              mobile,
              email: email || null,
              source: form.source,
              status: form.status,
              notes: notes || null,
              territoryId:
                form.territoryId || null,
            }
          );

        setLeads(
          (current) =>
            current.map(
              (lead) =>
                lead.id === updated.id
                  ? updated
                  : lead
            )
        );

        setSuccessMessage(
          "Lead updated successfully."
        );
      } else {
        const created =
          await createFranchiseLead({
            fullName,
            mobile,
            email: email || null,
            source: form.source,
            notes: notes || null,
            territoryId:
              form.territoryId || null,
          });

        setLeads(
          (current) => [
            created,
            ...current,
          ]
        );

        setSuccessMessage(
          "Lead created successfully."
        );
      }

      setFormOpen(false);
      resetForm();
    } catch (saveError) {
      setFormError(
        getApiErrorMessage(
          saveError,
          editingLeadId
            ? "Unable to update the lead."
            : "Unable to create the lead."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  if (accessLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Leads
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Loading franchise access…
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Leads
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Franchise lead management.
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-900">
            Unable to load franchise access
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {accessError}
          </p>

          <button
            type="button"
            onClick={() => {
              void refreshAccess();
            }}
            className="mt-5 rounded-xl bg-[#0B2D5C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123D73]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (
    !access ||
    !canViewLeads
  ) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Leads
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Franchise lead access.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-semibold text-amber-900">
            Access restricted
          </h2>

          <p className="mt-2 text-sm text-amber-800">
            Your franchise account does not have permission
            to view leads.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B2D5C] to-[#123D73] p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Franchise Lead Management
            </p>

            <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
              Leads
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Leads are restricted by the backend to your
              active district allocation.
              {canManageLeads
                ? " You can create and update leads within your authorized scope."
                : ""}
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:items-end">
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

            {canManageLeads && (
              <button
                type="button"
                onClick={openCreateForm}
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 text-sm font-bold text-[#0B2D5C] transition hover:bg-[#E3C45C] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Add Lead
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Leads
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {leads.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            New
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-700">
            {newLeadCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Follow Up
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-700">
            {followUpCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Converted
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {convertedCount}
          </p>
        </div>
      </section>

      {successMessage && (
        <section className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
          <CheckCircle2
            className="h-5 w-5 shrink-0"
            aria-hidden="true"
          />

          <span>{successMessage}</span>
        </section>
      )}

      {formOpen && canManageLeads && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D4AF37]">
                {editingLeadId
                  ? "Update Lead"
                  : "New Lead"}
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-900">
                {editingLeadId
                  ? "Edit lead details"
                  : "Add a lead"}
              </h2>
            </div>

            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              aria-label="Close lead form"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X
                className="h-5 w-5"
                aria-hidden="true"
              />
            </button>
          </div>

          <form
            onSubmit={submitLead}
            className="mt-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="lead-full-name"
                  className="block text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  Full Name
                </label>

                <input
                  id="lead-full-name"
                  type="text"
                  required
                  maxLength={150}
                  disabled={saving}
                  value={form.fullName}
                  onChange={(event) => {
                    updateForm(
                      "fullName",
                      event.target.value
                    );
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-mobile"
                  className="block text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  Mobile
                </label>

                <input
                  id="lead-mobile"
                  type="text"
                  required
                  maxLength={30}
                  disabled={saving}
                  value={form.mobile}
                  onChange={(event) => {
                    updateForm(
                      "mobile",
                      event.target.value
                    );
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-email"
                  className="block text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  Email
                </label>

                <input
                  id="lead-email"
                  type="email"
                  maxLength={180}
                  disabled={saving}
                  value={form.email}
                  onChange={(event) => {
                    updateForm(
                      "email",
                      event.target.value
                    );
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-source"
                  className="block text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  Source
                </label>

                <select
                  id="lead-source"
                  disabled={saving}
                  value={form.source}
                  onChange={(event) => {
                    updateForm(
                      "source",
                      event.target
                        .value as FranchiseLeadSource
                    );
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  {SOURCE_OPTIONS.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </div>

              {editingLeadId && (
                <div>
                  <label
                    htmlFor="lead-status"
                    className="block text-xs font-bold uppercase tracking-wide text-slate-500"
                  >
                    Status
                  </label>

                  <select
                    id="lead-status"
                    disabled={saving}
                    value={form.status}
                    onChange={(event) => {
                      updateForm(
                        "status",
                        event.target
                          .value as FranchiseLeadStatus
                      );
                    }}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  >
                    {STATUS_OPTIONS.map(
                      (option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              <div>
                <label
                  htmlFor="lead-territory"
                  className="block text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  Territory
                </label>

                <select
                  id="lead-territory"
                  disabled={
                    saving ||
                    !canViewTerritories
                  }
                  value={form.territoryId}
                  onChange={(event) => {
                    updateForm(
                      "territoryId",
                      event.target.value
                    );
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">
                    No territory
                  </option>

                  {territories.map(
                    (territory) => (
                      <option
                        key={territory.territoryId}
                        value={territory.territoryId}
                      >
                        {territory.name}
                      </option>
                    )
                  )}
                </select>

                {!canViewTerritories && (
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Your account does not have territory-view
                    permission. The lead can still be saved
                    without assigning a territory.
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="lead-notes"
                  className="block text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  Notes
                </label>

                <textarea
                  id="lead-notes"
                  rows={5}
                  maxLength={5000}
                  disabled={saving}
                  value={form.notes}
                  onChange={(event) => {
                    updateForm(
                      "notes",
                      event.target.value
                    );
                  }}
                  placeholder="Add follow-up notes or other operational details..."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {form.notes.length}/5000
                </p>
              </div>
            </div>

            {territoryError && (
              <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />

                <span>{territoryError}</span>
              </div>
            )}

            {formError && (
              <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />

                <span>{formError}</span>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] px-5 text-sm font-bold text-white transition hover:bg-[#123D73] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
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

                {saving
                  ? "Saving..."
                  : editingLeadId
                    ? "Save Changes"
                    : "Create Lead"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={closeForm}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {loading && (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-center gap-3 text-slate-600">
            <RefreshCw
              className="h-5 w-5 animate-spin"
              aria-hidden="true"
            />

            <p className="text-sm font-medium">
              Loading leads...
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
                Unable to Load Leads
              </h2>

              <p className="mt-2 text-sm leading-6 text-red-800">
                {error}
              </p>

              <button
                type="button"
                onClick={() => {
                  void loadLeads();
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
        leads.length === 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <UserRound
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No Leads Yet
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              There are currently no leads in your active
              district scope.
            </p>

            {canManageLeads && (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0B2D5C] px-4 text-sm font-bold text-white transition hover:bg-[#123D73]"
              >
                <Plus
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Add First Lead
              </button>
            )}
          </section>
        )}

      {!loading &&
        !error &&
        leads.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-slate-900">
                  District Leads
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {leads.length}{" "}
                  {leads.length === 1
                    ? "lead"
                    : "leads"}
                </p>
              </div>

              {canManageLeads && (
                <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  Management enabled
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Lead
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Contact
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Source
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Territory
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Updated
                    </th>

                    {canManageLeads && (
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {leads.map(
                    (lead) => (
                      <tr
                        key={lead.id}
                        className="align-top"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {lead.fullName}
                          </p>

                          {lead.notes && (
                            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                              {lead.notes}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          <p>{lead.mobile}</p>

                          <p className="mt-1 text-xs text-slate-500">
                            {lead.email ?? "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {sourceLabel(
                            lead.source
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {lead.territoryName ??
                            "Unassigned"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClassName(
                              lead.status
                            )}`}
                          >
                            {statusLabel(
                              lead.status
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatDateTime(
                            lead.updatedAt
                          )}
                        </td>

                        {canManageLeads && (
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => {
                                openEditForm(
                                  lead
                                );
                              }}
                              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-[#0B2D5C] transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Edit3
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />

                              Edit
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
    </div>
  );
}
