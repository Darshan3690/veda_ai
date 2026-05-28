"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Teacher = {
  teacherName: string;
  schoolName: string;
  email: string;
};

type AuthStore = {
  user: Teacher | null;
  setUser: (user: Teacher) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: "veda-teacher" },
  ),
);

