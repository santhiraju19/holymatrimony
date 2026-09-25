import SecureConnectBalanceCard from "@/features/secure-connect/components/SecureConnectBalanceCard";

export default function CallingMinutesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-50 via-white to-amber-50 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-[#B38B19]">
          Secure Connect
        </p>

        <h1 className="mt-2 text-3xl font-black text-[#0B2D5C]">
          My Calling Minutes
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          View your remaining audio and video calling minutes,
          manage purchased top-ups, and add more minutes when
          needed.
        </p>
      </div>

      <SecureConnectBalanceCard />
    </main>
  );
}
