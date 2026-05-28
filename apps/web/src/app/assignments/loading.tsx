export default function AssignmentsLoading() {
  return (
    <div className="min-h-screen bg-[#d4d4d4] p-4 lg:ml-[282px]">
      <div className="h-12 rounded-2xl bg-white/70" />
      <div className="mt-6 h-14 rounded-2xl bg-white/70" />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-32 rounded-2xl bg-white/70" />
        ))}
      </div>
    </div>
  );
}

