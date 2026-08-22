import Link from "next/link";

import {
  ArrowRight,
  BadgeCheck,
  BookHeart,
  CheckCircle2,
  Church,
  Heart,
  HeartHandshake,
  LockKeyhole,
  MapPin,
  MessageCircleHeart,
  Search,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";

const journeySteps = [
  {
    number: "01",
    icon: UserRoundCheck,
    title: "Create Your Profile",
    description:
      "Share your faith, family background, education, profession, lifestyle and the things that make you who you are.",
  },
  {
    number: "02",
    icon: Heart,
    title: "Tell Us What Matters",
    description:
      "Set thoughtful partner preferences around faith, age, location, education, lifestyle and other values important to you.",
  },
  {
    number: "03",
    icon: Search,
    title: "Discover Meaningful Matches",
    description:
      "Explore profiles and personalized recommendations designed to help you focus on compatible possibilities.",
  },
  {
    number: "04",
    icon: MessageCircleHeart,
    title: "Connect With Confidence",
    description:
      "Use interests, shortlists, verification indicators and protected communication as you get to know someone.",
  },
  {
    number: "05",
    icon: UsersRound,
    title: "Take the Journey Forward",
    description:
      "When a connection feels meaningful, continue the conversation thoughtfully and involve families when the time is right.",
  },
];

const compatibilityItems = [
  {
    icon: Church,
    title: "Faith",
    text: "Shared Christian faith and spiritual priorities.",
  },
  {
    icon: HeartHandshake,
    title: "Family Values",
    text: "Preferences that reflect the kind of family life you hope to build.",
  },
  {
    icon: Sparkles,
    title: "Denomination",
    text: "Denominational preferences when they are important to your search.",
  },
  {
    icon: BookHeart,
    title: "Education",
    text: "Educational preferences and personal aspirations.",
  },
  {
    icon: UsersRound,
    title: "Profession",
    text: "Career and professional preferences where relevant.",
  },
  {
    icon: MapPin,
    title: "Location",
    text: "Country, state and city preferences for your future.",
  },
  {
    icon: Heart,
    title: "Lifestyle",
    text: "Lifestyle choices that can matter in everyday married life.",
  },
  {
    icon: CheckCircle2,
    title: "Your Preferences",
    text: "The partner preferences you choose to make part of your search.",
  },
];

const values = [
  {
    icon: Church,
    title: "Faith-Centred",
    description:
      "Built specifically for Christian matrimony, with space for faith, denomination, church background and spiritual preferences.",
  },
  {
    icon: Sparkles,
    title: "Personalized Matching",
    description:
      "Recommendations help surface profiles aligned with the preferences and compatibility signals that matter to you.",
  },
  {
    icon: BadgeCheck,
    title: "Verification Signals",
    description:
      "Verification indicators provide additional context so members can make more informed decisions while connecting.",
  },
  {
    icon: LockKeyhole,
    title: "Privacy First",
    description:
      "Thoughtful privacy controls and protected member experiences are built into the platform from the beginning.",
  },
  {
    icon: ShieldCheck,
    title: "Safer Connections",
    description:
      "Member controls, secure communication and reporting tools support more respectful interactions.",
  },
  {
    icon: HeartHandshake,
    title: "Built for Commitment",
    description:
      "Holy Matrimony is designed around meaningful introductions for people seeking committed life partnerships.",
  },
];

export default function SuccessStoriesPage() {
  return (
    <main className="overflow-hidden bg-white text-slate-900">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#06162C]">
        <div className="pointer-events-none absolute -left-40 -top-48 h-[520px] w-[520px] rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-[#D4AF37]/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">
              <Sparkles size={15} />
              Faith • Family • Forever
            </div>

            <h1 className="mt-7 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl">
              Every Beautiful Story
              <span className="block bg-gradient-to-r from-[#F2D675] via-[#D4AF37] to-[#F7E7A4] bg-clip-text text-transparent">
                Starts With a First Step
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Holy Matrimony helps Christian singles discover meaningful
              connections shaped by faith, compatibility, family values and
              hopes for the future.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#F2D675] px-7 py-4 text-sm font-black text-[#06162C] shadow-[0_18px_50px_rgba(212,175,55,0.22)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(212,175,55,0.3)]"
              >
                Start Your Journey
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/search"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-7 py-4 text-sm font-bold text-white backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/10"
              >
                <Search size={18} />
                Discover Matches
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-x-7 gap-y-3 text-xs font-semibold text-slate-400 sm:text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Christian matrimony
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Compatibility focused
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Privacy conscious
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* EMOTIONAL POSITIONING */}
      <section className="relative bg-gradient-to-b from-[#FFFDF8] to-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#D4AF37]/10 text-[#B38B19]">
              <Heart size={30} />
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#B38B19]">
              A more meaningful search
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-[#0B2D5C] sm:text-4xl lg:text-5xl">
              You&apos;re Not Searching for Just Anyone.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              You&apos;re looking for someone with whom you can share faith,
              family, purpose, everyday moments and a lifetime of decisions.
              Holy Matrimony is designed to make that search more thoughtful,
              focused and meaningful.
            </p>
          </div>
        </div>
      </section>

      {/* JOURNEY */}
      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B38B19]">
              From profile to possibility
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B2D5C] sm:text-4xl">
              Your Journey on Holy Matrimony
            </h2>

            <p className="mt-5 leading-7 text-slate-600">
              A thoughtful path designed to help you move from discovering
              compatible profiles to building meaningful connections.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-5">
            {journeySteps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.number}
                  className="group relative rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/40 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0B2D5C] transition group-hover:bg-[#0B2D5C] group-hover:text-white">
                      <Icon size={23} />
                    </div>

                    <span className="text-3xl font-black text-slate-100">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-black text-[#0B2D5C]">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMPATIBILITY */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-[#0B2D5C]">
                <HeartHandshake size={16} />
                Meaningful compatibility
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight text-[#0B2D5C] sm:text-4xl lg:text-5xl">
                Compatibility Is More Than a Photograph.
              </h2>

              <p className="mt-6 text-base leading-8 text-slate-600">
                Attraction can begin an introduction, but meaningful
                compatibility can involve much more. Holy Matrimony gives
                members tools to express the preferences and values they care
                about while discovering potential matches.
              </p>

              <Link
                href="/register"
                className="mt-8 inline-flex items-center gap-2 font-black text-[#0B2D5C] transition hover:text-[#B38B19]"
              >
                Create your profile
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {compatibilityItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37]/10 text-[#B38B19]">
                      <Icon size={21} />
                    </div>

                    <div>
                      <h3 className="font-black text-[#0B2D5C]">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="relative overflow-hidden bg-[#071B35] py-20 text-white sm:py-24">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-[#D4AF37]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F2D675]">
              Designed with purpose
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Built Around What Matters
            </h2>

            <p className="mt-5 leading-7 text-slate-300">
              Holy Matrimony combines faith-centred discovery with modern
              matchmaking tools designed for serious relationships.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {values.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/30 hover:bg-white/[0.08]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4AF37]/10 text-[#F2D675]">
                    <Icon size={23} />
                  </div>

                  <h3 className="mt-5 text-xl font-black">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* HONEST STORIES */}
      <section className="bg-[#FFFDF8] py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[36px] border border-[#D4AF37]/20 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              <div className="flex min-h-[320px] items-center justify-center bg-gradient-to-br from-[#071B35] via-[#0B2D5C] to-[#123E77] p-10">
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#F2D675]/25 bg-[#D4AF37]/10 text-[#F2D675]">
                    <BookHeart size={36} />
                  </div>

                  <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#F2D675]">
                    Stories that matter
                  </p>

                  <h3 className="mt-3 text-3xl font-black text-white">
                    Real People.
                    <br />
                    Real Journeys.
                  </h3>
                </div>
              </div>

              <div className="p-8 sm:p-10 lg:p-12">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B38B19]">
                  Shared honestly
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B2D5C]">
                  When There&apos;s a Story to Tell, We&apos;ll Tell the Real One.
                </h2>

                <p className="mt-5 leading-8 text-slate-600">
                  As members build meaningful relationships through Holy
                  Matrimony, stories shared with their permission can be
                  featured here. We believe genuine experiences are more
                  valuable than manufactured testimonials.
                </p>

                <div className="mt-7 space-y-3">
                  {[
                    "Stories shared with member permission",
                    "No invented couples or fabricated testimonials",
                    "Privacy and personal boundaries respected",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 text-sm font-semibold text-slate-700"
                    >
                      <CheckCircle2
                        size={19}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-white py-20 sm:py-24">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#0B2D5C] text-[#F2D675] shadow-lg">
            <Heart size={29} fill="currentColor" />
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#B38B19]">
            Your next chapter
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B2D5C] sm:text-4xl lg:text-5xl">
            Perhaps Your Story Starts Today.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600">
            A meaningful journey can begin with something as simple as creating
            your profile and discovering someone whose values align with your
            own.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[#0B2D5C] px-8 py-4 text-sm font-black text-white shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-[#123E77]"
            >
              Create My Profile
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/login"
              className="inline-flex min-h-13 items-center justify-center rounded-2xl border border-slate-300 bg-white px-8 py-4 text-sm font-bold text-slate-700 transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37] hover:text-[#0B2D5C]"
            >
              Already a Member? Sign In
            </Link>
          </div>

          <p className="mt-7 text-xs text-slate-400">
            Holy Matrimony facilitates introductions and compatibility
            discovery. Relationships and marriage decisions remain personal
            choices of members and their families.
          </p>
        </div>
      </section>
    </main>
  );
}
