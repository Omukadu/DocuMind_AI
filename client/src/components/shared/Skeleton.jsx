export function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-dark-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-dark-700 rounded w-3/4" />
          <div className="h-3 bg-dark-700 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-dark-700 rounded" />
        <div className="h-3 bg-dark-700 rounded w-5/6" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 px-4 animate-pulse">
      <div className="w-8 h-8 rounded-lg bg-dark-700" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-dark-700 rounded w-2/5" />
        <div className="h-3 bg-dark-700 rounded w-1/4" />
      </div>
      <div className="h-3 bg-dark-700 rounded w-16" />
      <div className="h-3 bg-dark-700 rounded w-24" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 bg-dark-700 rounded ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  );
}
