export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Holy Matrimony"
            className="h-12 w-12"
          />

          <div>
            <h1 className="text-xl font-bold text-[#0B2D5C]">
              Holy Matrimony
            </h1>

            <p className="text-xs text-[#D4AF37]">
              Sacred Matchmaking
            </p>
          </div>
        </div>

        <nav className="hidden gap-8 md:flex">
          <a href="#">Home</a>
          <a href="#">Search</a>
          <a href="#">Membership</a>
          <a href="#">Churches</a>
          <a href="#">Contact</a>
        </nav>

        <button className="rounded-xl bg-[#0B2D5C] px-6 py-3 text-white">
          Register
        </button>
      </div>
    </header>
  );
}