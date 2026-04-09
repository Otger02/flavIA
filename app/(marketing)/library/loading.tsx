export default function LibraryLoading() {
  return (
    <section className="animate-pulse space-y-10">
      {/* Header */}
      <div className="space-y-4">
        <div className="h-4 w-20 rounded bg-stone-200/40" />
        <div className="h-10 w-80 rounded-xl bg-stone-200/50" />
        <div className="h-5 w-96 rounded-lg bg-stone-200/40" />
      </div>

      {/* Filter bar */}
      <div className="grid gap-6 rounded-[2rem] border border-stone-200/40 bg-white/60 p-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="h-3 w-28 rounded bg-stone-200/40" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 w-20 rounded-full bg-stone-200/40" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-3 w-28 rounded bg-stone-200/40" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-20 rounded-full bg-stone-200/40" />
            ))}
          </div>
        </div>
      </div>

      {/* Card grid */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-[2rem] border border-stone-200/30 bg-white/60">
            <div className="aspect-[16/10] bg-stone-200/40" />
            <div className="p-5 space-y-3">
              <div className="h-3 w-28 rounded bg-stone-200/40" />
              <div className="h-7 w-full rounded-lg bg-stone-200/50" />
              <div className="h-4 w-full rounded bg-stone-200/40" />
              <div className="h-4 w-3/4 rounded bg-stone-200/40" />
              <div className="flex gap-2">
                <div className="h-6 w-16 rounded-full bg-stone-200/40" />
                <div className="h-6 w-16 rounded-full bg-stone-200/40" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
