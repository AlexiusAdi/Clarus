import { CategoryType } from "@/lib/generated/prisma/enums";

export const DEFAULT_CATEGORIES = [
  { name: "Food", type: CategoryType.EXPENSE },
  { name: "Transport", type: CategoryType.EXPENSE },
  { name: "Entertainment", type: CategoryType.EXPENSE },
  { name: "Salary", type: CategoryType.INCOME },
  { name: "Stocks", type: CategoryType.INVESTMENT },
  { name: "Bitcoin", type: CategoryType.INVESTMENT },
  { name: "Bonds", type: CategoryType.INVESTMENT },
  { name: "Savings Account", type: CategoryType.INVESTMENT },
];
