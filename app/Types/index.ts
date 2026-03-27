import { PREDEFINED_ASSETS } from "@/constants";
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
  id?: string | null | undefined;
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | Blob | undefined;
}

// lib/assets/predefined.ts
//
// Master list of all assets users can track in Clarus.
// - identifier: the key stored in Investment.assetIdentifier and AssetPrice.identifier
// - ticker:     what gets passed to the price-fetch API (Yahoo Finance / CoinGecko)
// - label:      display name shown in the UI
// - type:       matches InvestmentType enum
// - exchange:   informational, shown as a badge in the dropdown
//
// To add more assets over time, just append to the relevant section.

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

// ── Lookup helpers ────────────────────────────────────────────────────────────
