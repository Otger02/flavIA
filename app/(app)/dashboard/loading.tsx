export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Greeting */}
      <div>
        <div className="h-10 w-48 rounded-xl bg-stone-200/50" />
        <div className="mt-3 h-5 w-80 rounded-lg bg-stone-200/40" />
      </div>

      {/* Emotional progress row */}
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 w-28 shrink-0 rounded-[1.25rem] bg-rose-100/30" />
        ))}
      </div>

      {/* Resume + Plan row */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.5rem] border border-rose-200/30 bg-white/60 p-6 space-y-4">
          <div className="h-3 w-40 rounded bg-rose-100/40" />
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-rose-100/30" />
            <div className="h-6 w-16 rounded-full bg-stone-200/40" />
          </div>
          <div className="h-4 w-full rounded bg-stone-200/40" />
          <div className="flex gap-3">
            <div className="h-10 w-28 rounded-full bg-rose-200/40" />
            <div className="h-10 w-28 rounded-full bg-stone-200/40" />
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-stone-200/30 bg-white/60 p-6 space-y-4">
          <div className="h-3 w-20 rounded bg-stone-200/40" />
          <div className="h-7 w-32 rounded-lg bg-stone-200/50" />
          <div className="h-4 w-48 rounded bg-stone-200/40" />
          <div className="h-10 w-32 rounded-full bg-rose-200/40" />
        </div>
      </div>

      {/* For you now - 3 cards */}
      <div>
        <div className="h-3 w-28 rounded bg-rose-100/40" />
        <div className="mt-2 h-4 w-56 rounded bg-stone-200/40" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-[1.25rem] border border-stone-200/30 bg-white/60">
              <div className="aspect-video bg-stone-200/40" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-16 rounded bg-stone-200/40" />
                <div className="h-5 w-full rounded bg-stone-200/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
