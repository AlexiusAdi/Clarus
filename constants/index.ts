import { TabsData } from "@/app/Types";
import {
  AcquisitionSource,
  AssetType,
  CategoryType,
} from "@/lib/generated/prisma/enums";
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

export const DEFAULT_ASSETS = [
  { name: "Cash", type: AssetType.CASH },
  { name: "Bank", type: AssetType.BANK },
  { name: "Property", type: AssetType.PROPERTY },
  { name: "Vehicle", type: AssetType.VEHICLE },
  { name: "Other", type: AssetType.OTHER },
  { name: "Gold", type: AssetType.GOLD },
] as const;

export const ACQUISITION_SOURCES = [
  { name: "Gifted", value: AcquisitionSource.GIFTED },
  { name: "Inherited", value: AcquisitionSource.INHERITED },
  { name: "Other", value: AcquisitionSource.OTHER },
  { name: "Purchased", value: AcquisitionSource.PURCHASED },
];

export const DEFAULT_ACTIONS = [
  {
    icon: ArrowUpRight,
    label: "Option",
    value: "option",
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
