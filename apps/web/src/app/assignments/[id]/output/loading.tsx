import { SkeletonPaper } from "@/components/ui/skeleton";

export default function OutputLoading() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 lg:ml-[282px]">
      <div className="mx-auto mt-6">
        <SkeletonPaper />
      </div>
    </div>
  );
}

