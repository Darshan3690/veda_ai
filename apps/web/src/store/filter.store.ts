"use client";

import { create } from "zustand";

type Filter = "Recent" | "Oldest" | "Due Soon";

type FilterStore = {
  searchTerm: string;
  selectedFilter: Filter;
  setSearchTerm: (searchTerm: string) => void;
  setSelectedFilter: (selectedFilter: Filter) => void;
};

export const useFilterStore = create<FilterStore>((set) => ({
  searchTerm: "",
  selectedFilter: "Recent",
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setSelectedFilter: (selectedFilter) => set({ selectedFilter }),
}));

