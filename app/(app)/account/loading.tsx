export default function AccountLoading() {
  return (
    <section className="animate-pulse space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="h-3 w-16 rounded bg-rose-100/40" />
        <div className="h-10 w-64 rounded-xl bg-stone-200/50" />
        <div className="h-5 w-96 rounded-lg bg-stone-200/40" />
      </div>

      {/* Billing + Summary row */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-[2rem] border border-stone-200/30 bg-white/60 p-6 space-y-6">
          <div className="flex justify-between">
            <div className="space-y-3">
              <div className="h-3 w-16 rounded bg-stone-200/40" />
              <div className="h-8 w-40 rounded-lg bg-stone-200/50" />
              <div className="flex gap-2">
                <div className="h-6 w-20 rounded-full bg-rose-100/30" />
                <div className="h-6 w-16 rounded-full bg-stone-200/40" />
              </div>
            </div>
            <div className="h-10 w-28 rounded-full bg-rose-200/40" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-rose-200/30 bg-rose-50/30 p-4 space-y-3">
              <div className="h-3 w-36 rounded bg-rose-100/40" />
              <div className="h-6 w-20 rounded bg-stone-200/50" />
              <div className="h-4 w-full rounded bg-stone-200/40" />
            </div>
            <div className="rounded-[1.5rem] border border-rose-200/30 bg-rose-50/30 p-4 space-y-3">
              <div className="h-3 w-36 rounded bg-rose-100/40" />
              <div className="h-6 w-28 rounded bg-stone-200/50" />
              <div className="h-4 w-full rounded bg-stone-200/40" />
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-200/30 bg-white/60 p-6 space-y-6">
          <div className="h-3 w-20 rounded bg-stone-200/40" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 rounded bg-stone-200/40" />
              <div className="h-7 w-40 rounded bg-stone-200/50" />
            </div>
          ))}
        </div>
      </div>

      {/* Sessions + Recommendations row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, col) => (
          <div key={col} className="rounded-[2rem] border border-stone-200/30 bg-white/60 p-6 space-y-5">
            <div className="space-y-3">
              <div className="h-3 w-28 rounded bg-rose-100/40" />
              <div className="h-7 w-48 rounded-lg bg-stone-200/50" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-[1.25rem] border border-stone-200/30 bg-white/40 p-4 flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-stone-200/50" />
                  <div className="h-3 w-20 rounded bg-stone-200/40" />
                </div>
                <div className="h-6 w-20 rounded-full bg-rose-100/30" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
