import {
  Frequency,
  InvestmentType,
  TransactionType,
} from "@/lib/generated/prisma/enums";
import {
  Bitcoin,
  CircleDollarSign,
  Coins,
  Landmark,
  PiggyBank,
  TrendingUp,
  Wallet,
} from "lucide-react";

export const DEFAULT_CATEGORIES = [
  // EXPENSE
  { name: "Food", type: TransactionType.EXPENSE },
  { name: "Transport", type: TransactionType.EXPENSE },
  { name: "Entertainment", type: TransactionType.EXPENSE },
  { name: "Shopping", type: TransactionType.EXPENSE },
  { name: "Health", type: TransactionType.EXPENSE },
  { name: "Other", type: TransactionType.EXPENSE },
  // INCOME
  { name: "Salary", type: TransactionType.INCOME },
  { name: "Freelance", type: TransactionType.INCOME },
  { name: "Business", type: TransactionType.INCOME },
  { name: "Other", type: TransactionType.INCOME },
];

export const DEFAULT_INVESTMENT_TYPES = [
  { name: "Stock", value: InvestmentType.STOCK },
  { name: "Crypto", value: InvestmentType.CRYPTO },
  { name: "Gold", value: InvestmentType.GOLD },
  { name: "Other", value: InvestmentType.OTHER },
];

export const DEFAULT_ACTIONS = [
  {
    icon: Wallet,
    label: "Add Transaction",
    value: "expense",
  },
  {
    icon: PiggyBank,
    label: "Add Investments",
    value: "savings",
  },
  {
    icon: Landmark,
    label: "Add Assets",
    value: "assets",
  },
];

export const TYPE_ICON = {
  STOCK: {
    icon: TrendingUp,
    className: "text-chart-5 bg-chart-5/12",
  },
  CRYPTO: {
    icon: Bitcoin,
    className: "text-amber bg-amber-soft",
  },
  GOLD: {
    icon: Coins,
    className: "text-sand bg-sand/12",
  },
  OTHER: {
    icon: CircleDollarSign,
    className: "text-muted-foreground bg-surface-2",
  },
} as const;

export const FREQUENCY_OPTIONS: { label: string; value: Frequency }[] = [
  { label: "Daily", value: Frequency.DAILY },
  { label: "Weekly", value: Frequency.WEEKLY },
  { label: "Monthly", value: Frequency.MONTHLY },
  { label: "Custom", value: Frequency.CUSTOM },
];

