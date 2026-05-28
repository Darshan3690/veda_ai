"use client";

import { Filter, Search } from "lucide-react";
import { useFilterStore } from "@/store/filter.store";

export function AssignmentFilters() {
  const { searchTerm, selectedFilter, setSearchTerm, setSelectedFilter } =
    useFilterStore();

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
      <label className="flex min-w-[110px] items-center gap-2 rounded-full px-2 text-sm font-medium text-zinc-400">
        <Filter className="size-4" />
        <select
          value={selectedFilter}
          onChange={(event) =>
            setSelectedFilter(event.target.value as "Recent" | "Oldest" | "Due Soon")
          }
          className="w-full bg-transparent outline-none"
        >
          <option>Recent</option>
          <option>Oldest</option>
          <option>Due Soon</option>
        </select>
      </label>
      <label className="ml-auto flex h-11 w-full max-w-[350px] items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 text-zinc-500 transition duration-200 hover:border-zinc-400 focus-within:border-zinc-700 focus-within:shadow-[0_0_0_3px_rgba(39,39,42,0.08)]">
        <Search className="size-4 shrink-0" />
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search Assignment"
          className="w-full bg-transparent pl-1 text-sm outline-none placeholder:text-zinc-400"
        />
      </label>
    </div>
  );
}
