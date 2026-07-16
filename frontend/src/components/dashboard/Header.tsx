export default function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b bg-white px-8 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-[#0B2D5C]">
          Dashboard
        </h1>

        <p className="text-sm text-gray-500">
          Welcome back to Holy Matrimony 👋
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-xl border px-4 py-2 hover:bg-slate-100">
          Notifications
        </button>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D4AF37] font-bold text-white">
          S
        </div>
      </div>
    </header>
  );
}