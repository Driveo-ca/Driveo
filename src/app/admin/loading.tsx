import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <Skeleton className="h-8 w-48 bg-foreground/[0.06] rounded mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 bg-foreground/[0.04] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[300px] bg-foreground/[0.04] rounded-2xl" />
    </div>
  );
}
