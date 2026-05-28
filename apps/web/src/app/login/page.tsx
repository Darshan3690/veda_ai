"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail, School, UserRound } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setUser({
      teacherName: String(form.get("teacherName") || "John Doe"),
      schoolName: String(form.get("schoolName") || "Delhi Public School"),
      email: String(form.get("email") || "teacher@veda.ai"),
    });
    router.push("/assignments");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#d4d4d4] px-5 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[430px] rounded-2xl bg-white p-7 shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
      >
        <Brand />
        <h1 className="mt-10 text-3xl font-extrabold text-[#252525]">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Set up your teacher workspace for this demo.
        </p>
        <div className="mt-8 space-y-4">
          <Field icon={<UserRound className="size-4" />} name="teacherName" placeholder="Teacher Name" />
          <Field icon={<School className="size-4" />} name="schoolName" placeholder="School Name" />
          <Field icon={<Mail className="size-4" />} name="email" placeholder="Email" type="email" />
        </div>
        <Button type="submit" className="mt-7 w-full">
          Continue
        </Button>
      </form>
    </main>
  );
}

function Field({
  icon,
  name,
  placeholder,
  type = "text",
}: {
  icon: React.ReactNode;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="flex h-12 items-center gap-3 rounded-full border border-zinc-200 bg-zinc-50 px-4 text-zinc-500">
      {icon}
      <input
        required
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm font-medium text-[#222] outline-none placeholder:text-zinc-400"
      />
    </label>
  );
}

