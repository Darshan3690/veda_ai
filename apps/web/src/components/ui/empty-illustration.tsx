export function EmptyIllustration() {
  return (
    <div className="relative mx-auto size-44">
      <div className="absolute inset-5 rounded-full bg-white" />
      <div className="absolute left-12 top-8 h-28 w-20 rounded-2xl bg-white shadow-sm">
        <div className="mx-auto mt-5 h-2 w-8 rounded-full bg-[#183140]" />
        <div className="mx-auto mt-5 h-2 w-11 rounded-full bg-zinc-200" />
        <div className="mx-auto mt-4 h-2 w-11 rounded-full bg-zinc-200" />
        <div className="mx-auto mt-4 h-2 w-11 rounded-full bg-zinc-200" />
      </div>
      <div className="absolute right-8 top-12 h-6 w-12 rounded-md bg-white shadow-sm">
        <span className="absolute left-3 top-2 block h-2 w-2 rounded-full bg-[#c9bfdc]" />
        <span className="absolute right-3 top-2 block h-2 w-5 rounded-full bg-zinc-300" />
      </div>
      <div className="absolute bottom-7 right-7 size-20 rounded-full border-[10px] border-[#d8cdeb] bg-white/50">
        <span className="absolute left-5 top-7 h-2 w-10 rotate-45 rounded-full bg-[#ff4b45]" />
        <span className="absolute left-5 top-7 h-2 w-10 -rotate-45 rounded-full bg-[#ff4b45]" />
      </div>
      <div className="absolute bottom-2 right-2 h-11 w-4 -rotate-45 rounded-full bg-[#d8cdeb]" />
      <div className="absolute left-5 top-12 h-12 w-16 -rotate-[32deg] rounded-full border-t-2 border-[#183140]" />
      <div className="absolute bottom-12 left-9 text-2xl font-bold text-[#3d85a4]">+</div>
      <div className="absolute right-0 top-24 size-2 rounded-full bg-[#3d85a4]" />
    </div>
  );
}

