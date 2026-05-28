import { MobileFab } from "./mobile-fab";
import { MobileNavbar } from "./mobile-navbar";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import type { ReactNode } from "react";

export function PageWrapper({
  children,
  label,
  showFab = true,
}: {
  children: ReactNode;
  label?: string;
  showFab?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#d4d4d4] text-[#2a2a2a]">
      <Sidebar createLabel={label === "Assignment" ? "Create Assignment" : "AI Teacher's Toolkit"} />
      <main className="min-h-screen pb-28 lg:ml-[282px] lg:p-4 lg:pb-4">
        <Topbar label={label} />
        {children}
      </main>
      <MobileNavbar />
      {showFab ? <MobileFab /> : null}
    </div>
  );
}
