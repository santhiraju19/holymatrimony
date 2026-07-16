"use client";

import Card from "@/components/ui/Card";

export default function SearchFilters() {
  return (
    <Card>
      <div className="grid gap-4 md:grid-cols-4">
        <input
          placeholder="Age From"
          className="rounded-xl border p-3"
        />

        <input
          placeholder="Age To"
          className="rounded-xl border p-3"
        />

        <select className="rounded-xl border p-3">
          <option>Denomination</option>
          <option>CSI</option>
          <option>CBCNC</option>
          <option>Independent</option>
          <option>Pentecostal</option>
        </select>

        <input
          placeholder="Location"
          className="rounded-xl border p-3"
        />
      </div>
    </Card>
  );
}