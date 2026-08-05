import {
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function SearchHeader() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-br from-[#071B36] via-[#0B2D5C] to-[#174A87] px-5 py-7 text-white shadow-[0_22px_60px_rgba(11,45,92,0.22)] sm:px-8 sm:py-9 lg:px-10">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-[#D4AF37]/15 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#F2D675]/30 bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#F2D675]">
            <Sparkles size={14} />
            Discover meaningful matches
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Find your life partner
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
            Explore Christian profiles using
            age, denomination, profession and
            location preferences.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <ShieldCheck
              size={23}
              className="text-[#F2D675]"
            />

            <p className="mt-3 text-sm font-bold">
              Privacy first
            </p>

            <p className="mt-1 text-xs text-blue-100">
              Secure browsing
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <HeartHandshake
              size={23}
              className="text-[#F2D675]"
            />

            <p className="mt-3 text-sm font-bold">
              Faith centred
            </p>

            <p className="mt-1 text-xs text-blue-100">
              Better compatibility
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}