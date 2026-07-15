import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function QuickSearch() {
  return (
    <section className="relative -mt-10 z-20">
      <div className="mx-auto max-w-7xl px-6">
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-[#0B2D5C]">
            Begin Your Journey
          </h2>

          <p className="mt-2 text-gray-500">
            Search verified Christian brides and grooms.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <input
              className="rounded-xl border border-gray-300 p-3"
              placeholder="Age From"
            />

            <input
              className="rounded-xl border border-gray-300 p-3"
              placeholder="Age To"
            />

            <input
              className="rounded-xl border border-gray-300 p-3"
              placeholder="Denomination"
            />

            <input
              className="rounded-xl border border-gray-300 p-3"
              placeholder="State"
            />

            <Button variant="secondary">
              Search
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}