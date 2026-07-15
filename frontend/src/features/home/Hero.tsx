import Image from "next/image";
import { Button } from "@/components/ui";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0B2D5C] via-[#123C73] to-[#0B2D5C] text-white">
      <div className="mx-auto flex min-h-[700px] max-w-7xl items-center px-6 py-20">

        <div className="max-w-3xl">

          <span className="rounded-full bg-[#D4AF37]/20 px-4 py-2 text-sm font-medium text-[#FFD95A]">
            India's Trusted Christian Matrimony
          </span>

          <h1 className="mt-8 text-5xl font-extrabold leading-tight md:text-7xl">
            Find Your
            <span className="block text-[#D4AF37]">
              God-Given Life Partner
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-xl leading-8 text-slate-200">
            Holy Matrimony helps Christian brides and grooms discover meaningful,
            faith-centered relationships through verified profiles, trusted church
            partnerships, and a secure matchmaking experience.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button variant="secondary">
              Begin Your Journey
            </Button>

            <Button variant="outline">
              Explore Profiles
            </Button>
          </div>

          <div className="mt-14 flex flex-wrap gap-10 text-center">
            <div>
              <h3 className="text-4xl font-bold text-[#D4AF37]">
                12,500+
              </h3>

              <p className="text-slate-300">
                Verified Profiles
              </p>
            </div>

            <div>
              <h3 className="text-4xl font-bold text-[#D4AF37]">
                180+
              </h3>

              <p className="text-slate-300">
                Churches
              </p>
            </div>

            <div>
              <h3 className="text-4xl font-bold text-[#D4AF37]">
                4,200+
              </h3>

              <p className="text-slate-300">
                Happy Matches
              </p>
            </div>
          </div>

        </div>

        <div className="hidden flex-1 justify-end lg:flex">
          <Image
            src="/images/hero/christian-couple.png"
            alt="Christian Couple"
            width={550}
            height={650}
            priority
          />
        </div>

      </div>
    </section>
  );
}