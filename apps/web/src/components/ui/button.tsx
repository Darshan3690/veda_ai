import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "light" | "ghost" | "danger";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-[#1f1f1f] text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:bg-black",
        variant === "light" && "bg-white text-[#202020] shadow-sm hover:bg-zinc-50",
        variant === "ghost" && "bg-transparent text-[#333] hover:bg-black/5",
        variant === "danger" && "bg-red-50 text-red-600 hover:bg-red-100",
        className,
      )}
      {...props}
    />
  );
}

