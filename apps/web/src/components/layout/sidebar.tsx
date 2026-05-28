"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Clock3,
  Home,
  LayoutGrid,
  Settings,
  Users,
} from "lucide-react";
import { Brand, ToolkitBadge } from "./brand";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", icon: Home, href: "/assignments" },
  { label: "My Groups", icon: Users, href: "/assignments" },
  { label: "Assignments", icon: ClipboardList, href: "/assignments", count: 10 },
  { label: "AI Teacher's Toolkit", icon: LayoutGrid, href: "/assignments/create" },
  { label: "My Library", icon: Clock3, href: "/assignments", count: 32 },
];

export function Sidebar({ createLabel = "Create Assignment" }: { createLabel?: string }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-4 top-4 z-30 hidden h-[calc(100vh-32px)] w-[250px] flex-col rounded-xl bg-white p-6 shadow-[0_28px_70px_rgba(0,0,0,0.18)] lg:flex">
      <Brand />
      <Link
        href="/assignments/create"
        className="mt-12 inline-flex h-11 items-center justify-center gap-2 rounded-full border-2 border-[#fb714d] bg-[#262626] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(251,113,77,0.28)]"
      >
        <ToolkitBadge>{createLabel}</ToolkitBadge>
      </Link>

      <nav className="mt-12 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.label === "Assignments"
              ? pathname.startsWith("/assignments")
              : pathname === item.href && item.label === "Home";
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium text-zinc-500",
                active && "bg-zinc-100 text-[#303030]",
              )}
            >
              <Icon className="size-4" />
              <span className="flex-1">{item.label}</span>
              {item.count ? (
                <span className="rounded-full bg-[#ff613c] px-2 py-0.5 text-xs font-bold text-white">
                  {item.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="mb-4 flex items-center gap-3 px-3 text-sm font-medium text-zinc-500">
          <Settings className="size-4" />
          Settings
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-zinc-100 p-3">
          <div className="grid size-11 place-items-center rounded-full bg-[#fff1dc] text-xl">
            T
          </div>
          <div>
            <p className="text-sm font-bold text-[#2b2b2b]">Delhi Public School</p>
            <p className="text-xs text-zinc-500">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
