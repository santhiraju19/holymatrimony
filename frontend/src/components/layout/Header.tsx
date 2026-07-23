"use client";

export default function Header() {
  const fullName =
    typeof window !== "undefined"
      ? localStorage.getItem("fullName")
      : "";

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
      <h1 className="text-xl font-semibold">
        Dashboard
      </h1>

      <div className="font-medium text-slate-700">
        {fullName}
      </div>
    </header>
  );
}
