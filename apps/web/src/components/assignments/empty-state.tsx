import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyIllustration } from "@/components/ui/empty-illustration";

export function EmptyState() {
  return (
    <section className="flex min-h-[calc(100vh-90px)] items-center justify-center px-5 py-12 lg:min-h-[calc(100vh-96px)]">
      <div className="max-w-[520px] text-center">
        <EmptyIllustration />
        <h1 className="mt-7 text-2xl font-extrabold text-[#2b2b2b]">
          No assignments yet
        </h1>
        <p className="mt-3 text-base leading-6 text-zinc-500">
          Create your first assignment to start collecting and grading student
          submissions. You can set up rubrics, define marking criteria, and let
          AI assist with grading.
        </p>
        <Link
          href="/assignments/create"
          className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-[#111] px-6 text-sm font-semibold text-white shadow-lg"
        >
          <Plus className="size-4" />
          Create Your First Assignment
        </Link>
      </div>
    </section>
  );
}

