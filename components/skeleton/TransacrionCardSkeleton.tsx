import { Card, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export const TransactionCardSkeleton = () => (
  <Card className="p-1 w-full shadow-md">
    <CardHeader className="p-3">
      <div className="flex w-full items-start gap-1 min-w-0">
        <Skeleton className="mt-1 h-5 w-5 rounded-full shrink-0" />
        <div className="flex-1 min-w-0 flex flex-col gap-2 px-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-36" />
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Skeleton className="h-4 w-16" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      </div>
    </CardHeader>
  </Card>
);
