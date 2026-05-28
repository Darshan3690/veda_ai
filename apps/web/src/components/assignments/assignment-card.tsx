"use client";

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, MoreVertical, Trash2 } from "lucide-react";
import { Assignment } from "@/lib/assignment-data";
import { apiUrl } from "@/lib/api";

export function AssignmentCard({
  assignment,
  menuId,
  openMenuId,
  setOpenMenuId,
  removeAssignment,
}: {
  assignment: Assignment;
  menuId: string;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  removeAssignment: (id: string) => void;
}) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const isOpen = openMenuId === menuId;
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    window.addEventListener("click", close);

    return () => {
      window.removeEventListener("click", close);
    };
  }, [setOpenMenuId]);

  async function deleteAssignment() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      console.log(`[DELETE] Deleting assignment: ${assignment.id}`);
      const response = await axios.delete(`${apiUrl}/assignments/${assignment.id}`);
      console.log(`[DELETE] Response status: ${response.status}`);
      console.log(`[DELETE] Check server logs for database deletion confirmation`);
      
      if (response.status === 204 || response.status === 200) {
        setOpenMenuId(null);
        removeAssignment(assignment.id);
        console.log(`[DELETE] ✅ Assignment ${assignment.id} deleted successfully from UI`);
      }
    } catch (error) {
      console.error("[DELETE] ❌ Failed to delete assignment:", error);
      const errorMsg = axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : "Failed to delete assignment";
      setDeleteError(errorMsg);
      if (axios.isAxiosError(error)) {
        console.error("[DELETE] Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <article
      ref={menuRef}
      className="relative min-h-32 overflow-visible rounded-2xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg"
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpenMenuId(isOpen ? null : menuId);
        }}
        className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-zinc-500 transition-all duration-200 hover:bg-neutral-100"
        aria-label="Open assignment menu"
        aria-expanded={isOpen}
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      {isOpen ? (
        <div
          onClick={(event) => event.stopPropagation()}
          className="absolute right-0 top-10 z-50 w-44 rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl"
        >
          <button
            type="button"
            onClick={() => router.push(`/assignments/${assignment.id}/output`)}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-neutral-700 transition-all duration-200 hover:bg-neutral-100"
          >
            <Eye className="size-4" />
            View Assignment
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deleteAssignment();
            }}
            disabled={isDeleting}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-500 transition-all duration-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="size-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
          {deleteError && (
            <p className="mt-2 text-xs text-red-500">{deleteError}</p>
          )}
        </div>
      ) : null}
      <Link
        href={`/assignments/${assignment.id}/output`}
        className="text-lg md:text-2xl font-extrabold underline decoration-2 underline-offset-2 hover:text-[#111]"
      >
        {assignment.title}
      </Link>
      <div className="mt-8 flex flex-wrap justify-between gap-3 text-sm md:text-base">
        <p>
          <span className="font-extrabold">Assigned on:</span>{" "}
          <span className="text-zinc-600">{assignment.assignedOn}</span>
        </p>
        <p>
          <span className="font-extrabold">Due:</span>{" "}
          <span className="text-zinc-600">{assignment.dueDate}</span>
        </p>
      </div>
    </article>
  );
}
