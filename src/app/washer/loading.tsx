import { Skeleton } from '@/components/ui/skeleton';

export default function WasherLoading() {
  return (
    <div className="px-5 md:px-10 pt-6 pb-8 max-w-[1280px] mx-auto animate-pulse">
      <Skeleton className="h-6 w-40 bg-foreground/[0.04] rounded mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 bg-foreground/[0.04] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[400px] bg-foreground/[0.04] rounded-2xl" />
    </div>
  );
}
