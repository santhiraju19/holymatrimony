import Image from "next/image";
import Button from "@/components/ui/Button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        <div className="flex items-center gap-3">

          <Image
            src="/logo.png"
            alt="Holy Matrimony"
            width={60}
            height={60}
            priority
          />

          <div>
            <h1 className="text-2xl font-bold text-[#0B2D5C]">
              Holy Matrimony
            </h1>

            <p className="text-sm text-[#D4AF37]">
              Faith • Family • Forever
            </p>
          </div>

        </div>

        <nav className="hidden items-center gap-8 lg:flex">
          <a href="#" className="hover:text-[#D4AF37]">Home</a>
          <a href="#" className="hover:text-[#D4AF37]">Search</a>
          <a href="#" className="hover:text-[#D4AF37]">Membership</a>
          <a href="#" className="hover:text-[#D4AF37]">Success Stories</a>
          <a href="#" className="hover:text-[#D4AF37]">Contact</a>
        </nav>

        <Button>Register Free</Button>

      </div>
    </header>
  );
}