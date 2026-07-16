"use client";

export default function BibleVerse() {
  return (
    <div className="rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur">
      <p className="text-sm uppercase tracking-[0.3em] text-yellow-300">
        Today's Scripture
      </p>

      <p className="mt-6 text-2xl font-semibold leading-10 text-white">
        "Therefore what God has joined together,
        let no one separate."
      </p>

      <p className="mt-5 text-lg text-slate-300">
        Mark 10:9
      </p>
    </div>
  );
}