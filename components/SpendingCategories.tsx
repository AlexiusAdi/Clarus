import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { SpendingChartProps } from "@/app/Types";

const SpendingCategories = ({
  data,
  totalExpense,
}: SpendingChartProps & { totalExpense: number }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Top Spending</CardTitle>
      </CardHeader>

      {data.map((category) => (
        <CardContent key={category.category}>
          <div className="w-full flex justify-between mb-1">
            <span>{category.category}</span>
            <span>
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(category.amount)}
            </span>
          </div>
          <Progress
            value={
              totalExpense > 0 ? (category.amount / totalExpense) * 100 : 0
            }
            className="w-full"
          />
        </CardContent>
      ))}
    </Card>
  );
};

export default SpendingCategories;
