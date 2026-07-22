"use client";

export default function Logo() {
  return (
    <div className="flex items-center gap-5">

      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#F4D06F] to-[#D4AF37] text-3xl shadow-xl">
        ✝
      </div>

      <div>

        <h1 className="text-3xl font-black tracking-wide">
          HOLY MATRIMONY
        </h1>

        <p className="mt-1 text-sm uppercase tracking-[0.35em] text-yellow-300">
          Faith • Family • Forever
        </p>

      </div>

    </div>
  );
}