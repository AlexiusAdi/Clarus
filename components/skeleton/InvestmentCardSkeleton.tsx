import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export const InvestmentCardSkeleton = () => (
  <Card className="w-full">
    <CardContent className="p-4 flex gap-3">
      <Skeleton className="h-8 w-8 rounded-md shrink-0" />
      <div className="flex flex-col gap-3 w-full">
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-20 ml-auto" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-48 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
