import { StaticImport } from "next/dist/shared/lib/get-img-props";

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
    category: { name: string } | null;
    description: string | null;
  }[];
  currentMonthTotal: number; // ← only this added
  topSpending: {
    id: string;
    amount: number;
    type: string;
    date: Date;
    category: { name: string } | null;
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
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | Blob | undefined;
}
