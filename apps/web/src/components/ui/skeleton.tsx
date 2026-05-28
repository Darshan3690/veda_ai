export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <article className="animate-pulse rounded-2xl bg-white p-6 shadow-sm">
      <div className="h-6 w-3/4 rounded bg-zinc-200" />
      <div className="mt-6 grid gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-4 w-full rounded bg-zinc-100" />
        ))}
      </div>
    </article>
  );
}

export function SkeletonPaper() {
  return (
    <div className="mx-auto max-w-[860px] rounded-2xl bg-white px-7 py-8 shadow-sm lg:px-10 lg:py-10 animate-pulse">
      <div className="h-8 w-1/2 rounded bg-zinc-200" />
      <div className="mt-6 space-y-3">
        <div className="h-4 w-full rounded bg-zinc-100" />
        <div className="h-4 w-full rounded bg-zinc-100" />
        <div className="h-4 w-3/4 rounded bg-zinc-100" />
      </div>
    </div>
  );
}
