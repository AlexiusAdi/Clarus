import { TransactionType } from "@/lib/generated/prisma/browser";

export type IncomeCardProps = {
  header: string;
  amount: number;
  className?: string;
  icon?: React.ReactNode;
  isVisible: boolean;
};

export interface UserNetWorth {
  totalIncome: number;
  totalExpense: number;
  netWorth: number;
  cashBalance: number;
  totalInvestments: number;
}

export type TabsData = {
  transactions: {
    id: string;
    amount: number;
    type: string;
    date: Date;
    category: { name: string; id: string } | null;
    goal: { name: string; id: string } | null;
    description: string | null;
  }[];
  currentMonthTotal: number;
  topSpending: {
    id: string;
    amount: number;
    type: string;
    date: Date;
    category: { name: string; id: string } | null;
    goal: { name: string; id: string } | null;
    description: string | null;
  }[];
  spendingByCategory: {
    category: string;
    amount: number;
  }[];
};

export interface SpendingChartProps {
  data: {
    category: string;
    amount: number;
  }[];
}

export interface SettingsUser {
  id?: string | null | undefined;
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | Blob | undefined;
}

export interface PredefinedAsset {
  identifier: string;
  ticker: string;
  label: string;
  type: "GOLD" | "STOCK" | "CRYPTO" | "OTHER";
  exchange?: string;
  unit: string; // default unit for this asset
}

export type TopSpendingList = TabsData["topSpending"];
export type TopSpendingItem = TabsData["topSpending"][number];

export interface SpendingChartProps {
  data: {
    category: string;
    amount: number;
  }[];
}

export type InitialValues = {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId?: string | null;
  goalId?: string | null;
  date: Date;
  description?: string | null;
};
