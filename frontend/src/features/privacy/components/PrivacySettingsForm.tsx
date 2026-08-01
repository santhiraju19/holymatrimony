
"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import usePrivacySettings from "@/features/privacy/hooks/usePrivacySettings";

import {
  CallPermission,
  PrivacySettings,
  VisibilityScope,
} from "@/features/privacy/types";

const visibilityOptions: Array<{
  value: VisibilityScope;
  label: string;
  description: string;
}> = [
  {
    value: "EVERYONE",
    label: "Everyone",
    description:
      "Visible to all visitors and members.",
  },
  {
    value: "REGISTERED_MEMBERS",
    label: "Registered members",
    description:
      "Visible only to signed-in members.",
  },
  {
    value: "VERIFIED_MEMBERS",
    label: "Verified members",
    description:
      "Visible only to verified members.",
  },
  {
    value: "INTEREST_ACCEPTED",
    label: "Accepted interests",
    description:
      "Visible only after an interest is accepted.",
  },
  {
    value: "MUTUAL_APPROVAL",
    label: "Mutual approval",
    description:
      "Visible only when both members approve.",
  },
  {
    value: "NOBODY",
    label: "Nobody",
    description:
      "Keep this information completely private.",
  },
];

const callOptions: Array<{
  value: CallPermission;
  label: string;
  description: string;
}> = [
  {
    value: "DISABLED",
    label: "Disabled",
    description:
      "Do not allow calls.",
  },
  {
    value: "INTEREST_ACCEPTED",
    label: "Accepted interests",
    description:
      "Allow calls after an interest is accepted.",
  },
  {
    value: "MUTUAL_APPROVAL",
    label: "Mutual approval",
    description:
      "Allow calls only after both members approve.",
  },
];

interface FormState {
  profileVisibility: VisibilityScope;
  photoVisibility: VisibilityScope;
  phoneVisibility: VisibilityScope;
  emailVisibility: VisibilityScope;
  addressVisibility: VisibilityScope;
  churchVisibility: VisibilityScope;
  familyVisibility: VisibilityScope;
  onlineVisibility: VisibilityScope;
  lastSeenVisibility: VisibilityScope;
  audioCallPermission: CallPermission;
  videoCallPermission: CallPermission;
  allowPhotoRequests: boolean;
  allowContactRequests: boolean;
}

function toFormState(
  settings: PrivacySettings
): FormState {
  return {
    profileVisibility:
      settings.profileVisibility,

    photoVisibility:
      settings.photoVisibility,

    phoneVisibility:
      settings.phoneVisibility,

    emailVisibility:
      settings.emailVisibility,

    addressVisibility:
      settings.addressVisibility,

    churchVisibility:
      settings.churchVisibility,

    familyVisibility:
      settings.familyVisibility,

    onlineVisibility:
      settings.onlineVisibility,

    lastSeenVisibility:
      settings.lastSeenVisibility,

    audioCallPermission:
      settings.audioCallPermission,

    videoCallPermission:
      settings.videoCallPermission,

    allowPhotoRequests:
      settings.allowPhotoRequests,

    allowContactRequests:
      settings.allowContactRequests,
  };
}

export default function PrivacySettingsForm() {
  const {
    settings,
    loading,
    saving,
    error,
    saved,
    reload,
    updateSettings,
  } = usePrivacySettings();

  const [form, setForm] =
    useState<FormState | null>(null);

  useEffect(() => {
    if (settings) {
      setForm(
        toFormState(settings)
      );
    }
  }, [settings]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form) {
      return;
    }

    await updateSettings(form);
  }

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
        <Loader2
          className="animate-spin text-blue-600"
          size={30}
        />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle
            className="mt-0.5 text-red-600"
            size={20}
          />

          <div>
            <h2 className="font-semibold text-red-800">
              Unable to load settings
            </h2>

            <p className="mt-1 text-sm text-red-700">
              {error ??
                "Please try again."}
            </p>

            <button
              type="button"
              onClick={() => {
                void reload();
              }}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <PrivacySection
        icon={
          <UserRound size={20} />
        }
        title="Profile visibility"
        description="Control who can see your profile and personal information."
      >
        <PrivacySelect
          label="Profile"
          description="Choose who can open your complete profile."
          value={
            form.profileVisibility
          }
          onChange={(value) =>
            setForm((current) =>
              current
                ? {
                    ...current,
                    profileVisibility:
                      value,
                  }
                : current
            )
          }
        />

        <PrivacySelect
          label="Photos"
          description="Protect your profile photos from unknown members."
          value={
            form.photoVisibility
          }
          onChange={(value) =>
            setForm((current) =>
              current
                ? {
                    ...current,
                    photoVisibility:
                      value,
                  }
                : current
            )
          }
        />

        <PrivacySelect
          label="Church information"
          description="Choose who can view church and denomination details."
          value={
            form.churchVisibility
          }
          onChange={(value) =>
            setForm((current) =>
              current
                ? {
                    ...current,
                    churchVisibility:
                      value,
                  }
                : current
            )
          }
        />

        <PrivacySelect
          label="Family details"
          description="Protect family information until trust is established."
          value={
            form.familyVisibility
          }
          onChange={(value) =>
            setForm((current) =>
              current
                ? {
                    ...current,
                    familyVisibility:
                      value,
                  }
                : current
            )
          }
        />
      </PrivacySection>

      <PrivacySection
        icon={<Lock size={20} />}
        title="Contact protection"
        description="Phone, email and address stay hidden by default."
      >
        <PrivacySelect
          label="Phone number"
          description="Choose when your phone number may be visible."
          value={
            form.phoneVisibility
          }
          onChange={(value) =>
            setForm((current) =>
              current
                ? {
                    ...current,
                    phoneVisibility:
                      value,
                  }
                : current
            )
          }
        />

        <PrivacySelect
          label="Email address"
          description="Control who can see your email."
          value={
            form.emailVisibility
          }
          onChange={(value) =>
            setForm((current) =>
              current
                ? {
                    ...current,
                    emailVisibility:
                      value,
                  }
                : current
            )
          }
        />

        <PrivacySelect
          label="Address"
          description="Keep your exact location and address private."
          value={
            form.addressVisibility
          }
          onChange={(value) =>
            setForm((current) =>
              current
                ? {
                    ...current,
                    addressVisibility:
                      value,
                  }
                : current
            )
          }
        />

        <PrivacyToggle
          label="Allow contact requests"
          description="Members can request contact access, but nothing is revealed automatically."
          checked={
            form.allowContactRequests
          }
          onChange={(checked) =>
            setForm((current) =>
              current
                ? {
                    ...current,
                    allowContactRequests:
                      checked,
                  }
                : current
            )
          }
        />
      </PrivacySection>

      <PrivacySection
        icon={
          <ShieldCheck size={20} />
        }
        title="Presence and activity"
        description="Control who can see when you are online or last active."
      >
        <PrivacySelect
          label="Online status"
          description="Choose who can see the online indicator."
          value={
            form.onlineVisibility
          }
          onChange={(value) =>
            setForm((current) =>
              current
                ? {
                    ...current,
                    onlineVisibility:
                      value,
                  }
                : current
            )
          }
        />

        <PrivacySelect
          label="Last seen"
          description="Choose who can see your most recent activity time."
          value={
            form.lastSeenVisibility
          }
          onChange={(value) =>
            setForm((current) =>
              current
                ? {
                    ...current,
                    lastSeenVisibility:
                      value,
                  }
                : current
            )
          }
        />

        <PrivacyToggle
          label="Allow photo requests"
          description="Members may request access to protected photos."
          checked={
            form.allowPhotoRequests
          }
          onChange={(checked) =>
            setForm((current) =>
              current
                ? {
                    ...current,
                    allowPhotoRequests:
                      checked,
                  }
                : current
            )
          }
        />
      </PrivacySection>

      <PrivacySection
        icon={<Phone size={20} />}
        title="Secure calling"
        description="Phone numbers remain hidden during in-app audio and video calls."
      >
        <CallPermissionSelect
          label="Audio calls"
          description="Choose who may start a secure audio call."
          value={
            form.audioCallPermission
          }
          onChange={(value) =>
            setForm((current) =>
              current
                ? {
                    ...current,
                    audioCallPermission:
                      value,
                  }
                : current
            )
          }
        />

        <CallPermissionSelect
          label="Video calls"
          description="Choose who may start a secure video call."
          value={
            form.videoCallPermission
          }
          onChange={(value) =>
            setForm((current) =>
              current
                ? {
                    ...current,
                    videoCallPermission:
                      value,
                  }
                : current
            )
          }
        />
      </PrivacySection>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <p>{error}</p>
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={18} />
          Privacy settings saved.
        </div>
      )}

      <div className="sticky bottom-4 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-w-40 items-center justify-center gap-2 rounded-2xl bg-[#0B2D5C] px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-[#123C73] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && (
            <Loader2
              size={18}
              className="animate-spin"
            />
          )}

          {saving
            ? "Saving..."
            : "Save privacy settings"}
        </button>
      </div>
    </form>
  );
}

function PrivacySection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          {icon}
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 divide-y divide-slate-100">
        {children}
      </div>
    </section>
  );
}

function PrivacySelect({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: VisibilityScope;
  onChange: (
    value: VisibilityScope
  ) => void;
}) {
  return (
    <div className="grid gap-3 py-5 md:grid-cols-[1fr_280px] md:items-center">
      <div>
        <h3 className="font-semibold text-slate-800">
          {label}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target
              .value as VisibilityScope
          )
        }
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
      >
        {visibilityOptions.map(
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
  );
}

function CallPermissionSelect({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: CallPermission;
  onChange: (
    value: CallPermission
  ) => void;
}) {
  return (
    <div className="grid gap-3 py-5 md:grid-cols-[1fr_280px] md:items-center">
      <div>
        <h3 className="font-semibold text-slate-800">
          {label}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target
              .value as CallPermission
          )
        }
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
      >
        {callOptions.map(
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
  );
}

function PrivacyToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (
    checked: boolean
  ) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-5">
      <div>
        <h3 className="font-semibold text-slate-800">
          {label}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() =>
          onChange(!checked)
        }
        className={[
          "relative h-7 w-12 shrink-0 rounded-full transition",
          checked
            ? "bg-emerald-500"
            : "bg-slate-300",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
            checked
              ? "left-6"
              : "left-1",
          ].join(" ")}
        />
      </button>
    </div>
  );
}