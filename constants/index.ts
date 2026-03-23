import { TabsData } from "@/app/Types";
import { CategoryType } from "@/lib/generated/prisma/enums";
import { ArrowUpRight, PiggyBank, Wallet } from "lucide-react";

export const DEFAULT_CATEGORIES = [
  { name: "Food", type: CategoryType.EXPENSE },
  { name: "Transport", type: CategoryType.EXPENSE },
  { name: "Entertainment", type: CategoryType.EXPENSE },
  { name: "Other", type: CategoryType.EXPENSE },
  { name: "Salary", type: CategoryType.INCOME },
  { name: "Stocks", type: CategoryType.INVESTMENT },
  { name: "Bitcoin", type: CategoryType.INVESTMENT },
  { name: "Bonds", type: CategoryType.INVESTMENT },
  { name: "Mutual Funds", type: CategoryType.INVESTMENT },
  { name: "Other", type: CategoryType.INVESTMENT },
  { name: "Savings Account", type: CategoryType.INVESTMENT },
];

export const DEFAULT_ACTIONS = [
  {
    icon: ArrowUpRight,
    label: "Add Income",
    value: "income",
  },
  {
    icon: Wallet,
    label: "Add Assets",
    value: "assets",
  },
  {
    icon: PiggyBank,
    label: "Add Investments",
    value: "savings",
  },
  {
    icon: Wallet,
    label: "Add Transaction",
    value: "expense",
  },
];

export type TopSpendingList = TabsData["topSpending"];
export type TopSpendingItem = TabsData["topSpending"][number];

export interface SpendingChartProps {
  data: {
    category: string;
    amount: number;
  }[];
}
