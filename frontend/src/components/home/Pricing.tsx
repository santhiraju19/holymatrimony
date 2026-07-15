export default function Pricing() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center text-[#0B2D5C]">
          Membership Plans
        </h2>

        <p className="mt-4 text-center text-gray-600">
          Choose the plan that best suits your journey.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-16">

          <div className="rounded-3xl border p-8 shadow">
            <h3 className="text-2xl font-bold">Basic</h3>
            <p className="text-4xl font-bold mt-4">Free</p>
            <button className="mt-8 w-full rounded-xl bg-[#0B2D5C] py-3 text-white">
              Register
            </button>
          </div>

          <div className="rounded-3xl border-2 border-[#D4AF37] p-8 shadow-xl">
            <h3 className="text-2xl font-bold">Premium</h3>
            <p className="text-4xl font-bold mt-4">₹999</p>
            <button className="mt-8 w-full rounded-xl bg-[#D4AF37] py-3 text-black font-semibold">
              Choose Premium
            </button>
          </div>

          <div className="rounded-3xl border p-8 shadow">
            <h3 className="text-2xl font-bold">Elite</h3>
            <p className="text-4xl font-bold mt-4">₹1999</p>
            <button className="mt-8 w-full rounded-xl bg-[#0B2D5C] py-3 text-white">
              Go Elite
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}