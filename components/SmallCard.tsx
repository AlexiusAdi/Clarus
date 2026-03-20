import { IncomeCardProps } from "@/app/Types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export const SmallCard = ({
  header,
  amount,
  icon,
  isVisible,
}: IncomeCardProps) => {
  return (
    <Card className="flex-1 p-3 gap-0">
      <CardHeader className="px-2 pb-1 gap-1">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {icon}
            {header}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 font-semibold">
        <span className={`transition-all duration-300`}>
          {isVisible ? `Rp ${amount.toLocaleString("id-ID")}` : "*******"}
        </span>
      </CardContent>
    </Card>
  );
};
