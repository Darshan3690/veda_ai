import Link from "next/link";
import { Bell, ChevronDown, Menu, ArrowLeft, Grid2X2 } from "lucide-react";
import { Brand } from "./brand";

export function Topbar({ label = "Assignment" }: { label?: string }) {
  return (
    <>
      <header className="hidden h-12 items-center justify-between rounded-2xl bg-white px-5 shadow-sm lg:flex">
        <div className="flex items-center gap-3 text-sm font-medium text-zinc-400">
          <Link
            href="/assignments"
            className="grid size-8 place-items-center rounded-full bg-zinc-50 text-[#222]"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <Grid2X2 className="size-4" />
          <span>{label}</span>
        </div>
        <UserCluster />
      </header>

      <header className="sticky top-0 z-20 flex h-[58px] items-center justify-between rounded-b-xl bg-white px-4 shadow-sm lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <BellButton />
          <div className="size-8 rounded-full bg-[linear-gradient(135deg,#f7c289,#2b3137)]" />
          <button className="grid size-8 place-items-center rounded-full bg-zinc-50">
            <Menu className="size-5" />
          </button>
        </div>
      </header>
    </>
  );
}

function BellButton() {
  return (
    <button className="relative grid size-9 place-items-center rounded-full bg-white shadow-sm">
      <Bell className="size-5 text-[#1f1f1f]" />
      <span className="absolute right-1.5 top-1 size-2 rounded-full bg-[#ff4b2f]" />
    </button>
  );
}

function UserCluster() {
  return (
    <div className="flex items-center gap-4">
      <BellButton />
      <div className="flex items-center gap-2 rounded-full bg-zinc-50 px-2 py-1">
        <div className="size-8 rounded-full bg-[linear-gradient(135deg,#f7c289,#2b3137)]" />
        <span className="text-sm font-bold text-[#262626]">John Doe</span>
        <ChevronDown className="size-4" />
      </div>
    </div>
  );
}

