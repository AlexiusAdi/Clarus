import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { SpendingChartProps } from "@/app/Types";

const SpendingCategories = ({
  data,
  totalExpense,
}: SpendingChartProps & { totalExpense: number }) => {
  return (
    <Card className="w-full rounded-2xl shadow-none gap-0">
      <CardHeader className="pb-1">
        <CardTitle className="headline text-lg">By category</CardTitle>
      </CardHeader>
      {data.length === 0 ? (
        <CardContent className="text-sm text-muted-foreground">
          <p className="text-center py-10">No spending data available.</p>
        </CardContent>
      ) : (
        <CardContent className="pt-3 flex flex-col gap-3.5">
          {data.map((category, index) => {
            const percent =
              totalExpense > 0 ? (category.amount / totalExpense) * 100 : 0;

            return (
              <div key={category.category}>
                <div className="w-full flex items-baseline justify-between gap-3 mb-1.5">
                  <span className="flex items-center gap-2 min-w-0 text-sm font-medium">
                    <i
                      aria-hidden
                      className="size-2.5 rounded-[3px] shrink-0"
                      style={{
                        background: `var(--chart-${(index % 5) + 1})`,
                      }}
                    />
                    <span className="truncate">{category.category}</span>
                  </span>
                  <span className="flex items-baseline gap-2.5 shrink-0">
                    <span className="tabular text-sm font-semibold">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                      }).format(category.amount)}
                    </span>
                    <span className="tabular text-xs text-muted-foreground w-9 text-right">
                      {percent.toFixed(0)}%
                    </span>
                  </span>
                </div>
                <Progress
                  value={percent}
                  className="w-full h-1.5 bg-surface-2"
                />
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
};

export default SpendingCategories;
