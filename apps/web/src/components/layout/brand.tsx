import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-[#ff9a35] to-[#8f1f24] text-white shadow-lg shadow-orange-900/20">
        <span className="text-lg font-black">V</span>
      </div>
      <span className="text-xl font-extrabold tracking-[-0.01em] text-[#262626]">
        VedaAI
      </span>
    </div>
  );
}

export function ToolkitBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Sparkles className="size-4" />
      {children}
    </span>
  );
}
