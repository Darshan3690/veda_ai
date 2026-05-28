import Link from "next/link";
import { Plus } from "lucide-react";

export function MobileFab() {
  return (
    <Link
      href="/assignments/create"
      className="fixed bottom-20 right-5 z-40 grid size-12 place-items-center rounded-full bg-white text-[#ff613c] shadow-[0_12px_30px_rgba(0,0,0,0.2)] lg:hidden"
      aria-label="Create assignment"
    >
      <Plus className="size-6" />
    </Link>
  );
}

