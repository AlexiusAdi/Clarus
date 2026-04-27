import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export const AssetCardSkeleton = () => (
  <Card className="w-full">
    <CardContent className="pt-4">
      <Skeleton className="h-8 w-8 rounded-md" />
      <div className="flex flex-col gap-3 mt-2">
        <div className="flex justify-between pt-2">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-20" />
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
