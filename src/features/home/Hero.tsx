import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-[#0B2D5C] via-[#123C73] to-[#0B2D5C] text-white">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="max-w-3xl">
          <span className="rounded-full bg-[#D4AF37]/20 px-4 py-2 text-sm font-medium text-[#FFD95A]">
            India's Trusted Christian Matrimony
          </span>

          <h1 className="mt-8 text-5xl font-extrabold leading-tight lg:text-7xl">
            Find Your
            <span className="block text-[#D4AF37]">
              God-Given Life Partner
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-xl text-slate-200">
            Holy Matrimony connects Christian brides and grooms through
            verified profiles, trusted churches, and faith-centered
            relationships.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button variant="secondary">
              Begin Your Journey
            </Button>

            <Button variant="outline">
              Explore Profiles
            </Button>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-8">
            <div>
              <h3 className="text-3xl font-bold text-[#D4AF37]">12,500+</h3>
              <p className="text-slate-300">Verified Profiles</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-[#D4AF37]">180+</h3>
              <p className="text-slate-300">Church Partners</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-[#D4AF37]">4,200+</h3>
              <p className="text-slate-300">Happy Matches</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}