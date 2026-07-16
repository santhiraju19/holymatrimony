"use client";

import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Search
          size={22}
          className="text-slate-400"
        />

        <input
          type="text"
          placeholder="Search by name, profession, church..."
          className="flex-1 border-none bg-transparent text-lg outline-none"
        />
      </div>
    </div>
  );
}