interface SkeletonProps {
  variant?: "cards" | "table" | "stats";
  count?: number;
}

export function Skeleton({ variant = "cards", count = 6 }: SkeletonProps) {
  if (variant === "stats") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="h-28 rounded-xl bg-slate-200 border border-slate-200"
          />
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 animate-pulse">
        <div className="h-8 w-full rounded bg-slate-200" />
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="h-12 w-full rounded bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-slate-200 bg-white overflow-hidden"
        >
          <div className="h-44 w-full bg-slate-200" />
          <div className="p-4 space-y-3">
            <div className="h-5 w-2/3 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-9 w-full rounded-lg bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}