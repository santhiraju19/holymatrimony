import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-4">

          <Image
            src="/logo.png"
            alt="Holy Matrimony"
            width={72}
            height={72}
            priority
            className="rounded-full object-contain"
          />

          <div>
            <h1 className="text-2xl font-bold text-[#0B2D5C]">
              Holy Matrimony
            </h1>

            <p className="text-sm tracking-wide text-[#D4AF37]">
              Faith • Family • Forever
            </p>
          </div>

        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 text-[15px] font-medium lg:flex">

          <Link href="/" className="transition hover:text-[#D4AF37]">
            Home
          </Link>

          <Link href="/search" className="transition hover:text-[#D4AF37]">
            Search
          </Link>

          <Link href="/membership" className="transition hover:text-[#D4AF37]">
            Membership
          </Link>

          <Link href="/success-stories" className="transition hover:text-[#D4AF37]">
            Success Stories
          </Link>

          <Link href="/contact" className="transition hover:text-[#D4AF37]">
            Contact
          </Link>

        </nav>

        {/* Right Buttons */}
        <div className="flex items-center gap-3">

          <Link href="/login">
            <button className="rounded-xl border border-[#0B2D5C] px-5 py-2 font-medium text-[#0B2D5C] transition hover:bg-[#0B2D5C] hover:text-white">
              Login
            </button>
          </Link>

          <Button>
            Register Free
          </Button>

        </div>

      </div>
    </header>
  );
}