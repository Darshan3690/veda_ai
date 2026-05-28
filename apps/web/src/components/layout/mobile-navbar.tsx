"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Briefcase, Home, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", icon: Home, href: "/assignments" },
  { label: "Assignments", icon: Briefcase, href: "/assignments" },
  { label: "Library", icon: BookOpen, href: "/assignments" },
  { label: "AI Toolkit", icon: Sparkles, href: "/assignments/create" },
];

export function MobileNavbar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-3 left-4 right-4 z-40 flex h-16 items-center justify-around rounded-2xl bg-[#111] px-2 shadow-[0_12px_35px_rgba(0,0,0,0.35)] lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          item.label === "Assignments"
            ? pathname.startsWith("/assignments") && !pathname.includes("create")
            : pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex min-w-14 flex-col items-center gap-1 text-[10px] font-semibold text-zinc-500",
              active && "text-white",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

