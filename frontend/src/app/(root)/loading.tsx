import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  // This skeleton mimics your main layout with a sidebar and content area.
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar Skeleton */}
      <div className="hidden lg:flex flex-col gap-4 border-r bg-background p-4 w-72">
        <div className="flex items-center gap-2 p-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 space-y-6 px-2">
          {/* Menu Group Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
          {/* Another Menu Group Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
        <div className="p-2">
          <Skeleton className="h-12 w-full" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 p-6 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}