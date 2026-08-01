
import PrivacySettingsForm from "@/features/privacy/components/PrivacySettingsForm";

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-5xl">
      <div className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Privacy First
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Privacy Settings
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Control who can view your profile,
          photos, contact details, presence,
          and secure calling permissions.
        </p>
      </div>

      <PrivacySettingsForm />
    </main>
  );
}