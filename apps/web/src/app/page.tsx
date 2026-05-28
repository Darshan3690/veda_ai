import { redirect } from "next/navigation";

// Force Vercel to rebuild - timestamp trigger
export default function Home() {
  redirect("/login");
}

