import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type StepperProps = {
  current: number;
  steps: string[];
};

export function Stepper({ current, steps }: StepperProps) {
  return (
    <div className="mx-auto flex w-full max-w-[580px] items-center gap-3 px-4 py-4">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const active = current === stepNumber;
        const complete = current > stepNumber;

        return (
          <div key={step} className="flex flex-1 items-center gap-3 last:flex-none">
            <div
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full border text-xs font-bold",
                active && "border-[#1f1f1f] bg-[#1f1f1f] text-white",
                complete && "border-emerald-500 bg-emerald-500 text-white",
                !active && !complete && "border-zinc-300 bg-white text-zinc-500",
              )}
            >
              {complete ? <Check className="size-4" /> : stepNumber}
            </div>
            <span
              className={cn(
                "hidden text-sm font-semibold sm:block",
                active ? "text-[#252525]" : "text-zinc-500",
              )}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-1 flex-1 rounded-full",
                  complete ? "bg-[#1f1f1f]" : "bg-zinc-300",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

