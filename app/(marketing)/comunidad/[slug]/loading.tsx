export default function ThreadLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-8">
      {/* Back link */}
      <div className="h-4 w-32 rounded bg-stone-200/60" />

      {/* Thread header */}
      <div className="space-y-4 rounded-[2rem] border border-stone-200/40 bg-white/70 p-6">
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-full bg-stone-200/50" />
          <div className="h-6 w-16 rounded-full bg-stone-200/40" />
        </div>
        <div className="h-8 w-full rounded-lg bg-stone-200/60" />
        <div className="h-5 w-3/4 rounded bg-stone-200/50" />
        <div className="flex gap-4 pt-2">
          <div className="h-3 w-20 rounded bg-stone-200/40" />
          <div className="h-3 w-16 rounded bg-stone-200/40" />
        </div>
      </div>

      {/* Comments skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-28 rounded bg-stone-200/50" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-[1.5rem] border border-stone-200/30 bg-white/60 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-stone-200/50" />
              <div className="h-4 w-24 rounded bg-stone-200/50" />
              <div className="h-3 w-16 rounded bg-stone-200/30" />
            </div>
            <div className="h-4 w-full rounded bg-stone-200/40" />
            <div className="h-4 w-4/5 rounded bg-stone-200/30" />
          </div>
        ))}
      </div>
    </div>
  );
}
