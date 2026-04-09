export default function StoriesLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-10">
      {/* Header */}
      <div>
        <div className="h-3 w-20 rounded bg-rose-100/40" />
        <div className="mt-3 h-10 w-56 rounded-xl bg-stone-200/50" />
        <div className="mt-3 h-5 w-full max-w-xl rounded-lg bg-stone-200/40" />
        <div className="mt-2 h-5 w-72 rounded-lg bg-stone-200/40" />
      </div>

      {/* Form placeholder */}
      <div className="rounded-[2rem] border border-stone-200/30 bg-white/60 p-6 space-y-4">
        <div className="h-3 w-32 rounded bg-rose-100/40" />
        <div className="h-28 w-full rounded-[1.25rem] bg-stone-200/40" />
        <div className="flex items-center justify-between">
          <div className="h-5 w-36 rounded bg-stone-200/40" />
          <div className="h-10 w-28 rounded-full bg-rose-200/40" />
        </div>
      </div>

      {/* Story cards */}
      <div className="space-y-6">
        <div className="h-3 w-48 rounded bg-stone-200/40" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[1.5rem] border border-stone-200/30 bg-white/60 p-6 space-y-4"
            >
              <div className="h-4 w-full rounded bg-stone-200/40" />
              <div className="h-4 w-5/6 rounded bg-stone-200/40" />
              <div className="h-4 w-2/3 rounded bg-stone-200/40" />
              <div className="mt-2 flex items-center gap-2">
                <div className="h-3 w-16 rounded bg-stone-200/40" />
                <div className="h-3 w-16 rounded bg-stone-200/40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
