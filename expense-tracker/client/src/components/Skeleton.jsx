export function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800 ${className}`} />;
}

export function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonBlock className="h-12" key={index} />
      ))}
    </div>
  );
}
