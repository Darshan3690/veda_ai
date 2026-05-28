"use client";

import { useMemo, useEffect } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { AssignmentFilters } from "@/components/assignments/assignment-filters";
import { EmptyState } from "@/components/assignments/empty-state";
import { SkeletonCard } from "@/components/ui/skeleton";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { useAssignmentStore } from "@/store/assignment.store";
import { useFilterStore } from "@/store/filter.store";
import { apiUrl } from "@/lib/api";
import { getAssignment } from "@/lib/assignment-api";

export default function AssignmentsPage() {
  const { searchTerm, selectedFilter } = useFilterStore();
  const { assignments, openMenuId, setOpenMenuId, removeAssignment, addOrUpdateAssignment } =
    useAssignmentStore();

  // Fetch recently created assignments from backend
  useEffect(() => {
    const loadRecentAssignments = async () => {
      try {
        const recentIds = JSON.parse(localStorage.getItem("recentAssignments") || "[]") as string[];
        if (recentIds.length === 0) return;
        
        for (const assignmentId of recentIds) {
          try {
            const transformed = await getAssignment(assignmentId);
            addOrUpdateAssignment(transformed);
          } catch (error) {
            console.warn(`Failed to load assignment ${assignmentId}`, error);
            // Skip if assignment not found
          }
        }
      } catch (error) {
        console.warn("Failed to load recent assignments", error);
      }
    };
    loadRecentAssignments();
  }, [addOrUpdateAssignment]);

  const visibleAssignments = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const filtered = assignments.filter(
      (assignment) =>
        assignment.title.toLowerCase().includes(term) ||
        assignment.subject.toLowerCase().includes(term) ||
        assignment.dueDate.toLowerCase().includes(term),
    );
    return [...filtered].sort((a, b) => {
      if (selectedFilter === "Oldest") {
        return a.assignedOn.localeCompare(b.assignedOn);
      }
      if (selectedFilter === "Due Soon") {
        return a.dueDate.localeCompare(b.dueDate);
      }
      return b.assignedOn.localeCompare(a.assignedOn);
    });
  }, [searchTerm, selectedFilter, assignments]);

  return (
    <PageWrapper label="Assignment">
      <section className="px-4 pt-6 lg:px-0">
        <div className="mb-4 hidden items-start gap-3 lg:flex">
          <span className="mt-1 size-3 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.2)]" />
          <div>
            <h1 className="text-xl font-extrabold">Assignments</h1>
            <p className="text-sm text-zinc-500">
              Manage and create assignments for your classes.
            </p>
          </div>
        </div>
        <div className="mb-5 flex items-center justify-center gap-4 lg:hidden">
          <Link
            href="/assignments"
            className="grid size-10 place-items-center rounded-full bg-zinc-100 text-[#222]"
          >
            <span className="text-2xl leading-none">‹</span>
          </Link>
          <h1 className="flex-1 text-center text-base font-extrabold">Assignments</h1>
          <span className="size-10" />
        </div>

        <AssignmentFilters />

        {visibleAssignments.length === 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {visibleAssignments.map((assignment, index) => (
                <AssignmentCard
                  key={`${assignment.id}-${index}`}
                  assignment={assignment}
                  menuId={`${assignment.id}-${index}`}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  removeAssignment={removeAssignment}
                />
              ))}
            </div>
            <Link
              href="/assignments/create"
              className="fixed bottom-6 left-1/2 z-30 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-[#111] px-7 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(0,0,0,0.24)] lg:flex"
            >
              <Plus className="size-4" />
              Create Assignment
            </Link>
          </>
        )}
      </section>
    </PageWrapper>
  );
}
