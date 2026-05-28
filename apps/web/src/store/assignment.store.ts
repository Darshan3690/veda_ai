"use client";

import { create } from "zustand";
import { assignments as initialAssignments, type Assignment } from "@/lib/assignment-data";

type AssignmentStore = {
  assignments: Assignment[];
  openMenuId: string | null;
  removeAssignment: (id: string) => void;
  setOpenMenuId: (id: string | null) => void;
  addOrUpdateAssignment: (assignment: Assignment) => void;
};

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: initialAssignments,
  openMenuId: null,
  removeAssignment: (id) =>
    set((state) => ({
      assignments: state.assignments.filter((assignment) => assignment.id !== id),
      openMenuId: null,
    })),
  setOpenMenuId: (id) => set({ openMenuId: id }),
  addOrUpdateAssignment: (assignment) =>
    set((state) => {
      const exists = state.assignments.findIndex((a) => a.id === assignment.id) !== -1;
      if (exists) {
        return {
          assignments: state.assignments.map((a) =>
            a.id === assignment.id ? assignment : a,
          ),
        };
      }
      return {
        assignments: [assignment, ...state.assignments],
      };
    }),
}));
