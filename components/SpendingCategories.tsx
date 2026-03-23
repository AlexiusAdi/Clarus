import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { SpendingChartProps } from "@/app/Types";

const SpendingCategories = ({ data }: SpendingChartProps) => {
  const maxAmount = Math.max(...data.map((cat) => cat.amount));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Top Spending Categories</CardTitle>
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
            value={(category.amount / maxAmount) * 100}
            className="w-full"
          />
        </CardContent>
      ))}
    </Card>
  );
};

export default SpendingCategories;
