import { Skeleton } from '@/components/ui/skeleton';

export default function CustomerLoading() {
  return (
    <div className="px-5 md:px-10 pt-6 pb-8 max-w-[1280px] mx-auto animate-pulse">
      <Skeleton className="h-5 w-32 bg-foreground/[0.04] rounded mb-2" />
      <Skeleton className="h-8 w-48 bg-foreground/[0.06] rounded mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <Skeleton className="h-[320px] bg-foreground/[0.04] rounded-2xl" />
        <Skeleton className="h-[320px] bg-foreground/[0.04] rounded-2xl" />
      </div>
    </div>
  );
}
