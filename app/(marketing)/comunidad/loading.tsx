export default function ComunidadLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-3 w-20 rounded bg-stone-200/60" />
        <div className="h-10 w-64 rounded-lg bg-stone-200/60" />
        <div className="h-5 w-96 rounded bg-stone-200/40" />
      </div>
      <div className="flex gap-2">
        <div className="h-10 w-40 rounded-2xl bg-stone-200/40" />
        <div className="h-10 w-32 rounded-2xl bg-stone-200/40" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-stone-200/30 bg-white/40 p-5 space-y-3">
            <div className="h-4 w-48 rounded bg-stone-200/50" />
            <div className="h-6 w-full rounded bg-stone-200/40" />
            <div className="h-4 w-3/4 rounded bg-stone-200/30" />
            <div className="flex gap-4">
              <div className="h-3 w-16 rounded bg-stone-200/30" />
              <div className="h-3 w-20 rounded bg-stone-200/30" />
              <div className="h-3 w-12 rounded bg-stone-200/30" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
