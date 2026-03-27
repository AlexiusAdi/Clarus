"use client";

import SpendingChart from "./SpendingChart";
import SpendingCategories from "./SpendingCategories";
import RecentActivities from "./RecentActivities";
import InvestmentChart from "./InvestmentChart";
import InvestmentCard from "./InvestmentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { TabsData } from "@/app/Types";
import { Asset, Investment } from "@/lib/generated/prisma/client";
import { AssetCard } from "./AssetCard";

const HomeTabs = ({
  tabData,
  assets,
  investments,
}: {
  tabData: TabsData;
  assets: Asset[];
  investments: Investment[]; // Replace 'any' with the actual type for investments
}) => {
  const { transactions, currentMonthTotal, topSpending, spendingByCategory } =
    tabData;

  return (
    <Tabs defaultValue="overview" className="w-full items-center">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="Transactions">Transactions</TabsTrigger>
        <TabsTrigger value="Investments">Investments</TabsTrigger>
        <TabsTrigger value="Assets">Assets</TabsTrigger>
      </TabsList>

      {/* ✅ Overview */}
      <TabsContent value="overview" className="w-full">
        <div className="flex flex-col gap-3">
          <SpendingChart data={spendingByCategory} />
          <SpendingCategories
            data={spendingByCategory}
            totalExpense={currentMonthTotal}
          />
          <RecentActivities data={topSpending} isShown={true} />
        </div>
      </TabsContent>

      {/* ✅ Transactions */}
      <TabsContent value="Transactions" className="w-full">
        <RecentActivities data={transactions} isShown={false} />
      </TabsContent>

      {/* Investments */}
      <TabsContent value="Investments" className="w-full flex flex-col gap-2">
        <InvestmentChart investments={investments} />
        {investments.length === 0 ? (
          <p className="text-center py-10 text-sm text-muted-foreground">
            No recent investments available.
          </p>
        ) : (
          investments.map((investment) => (
            <InvestmentCard key={investment.id} investment={investment} />
          ))
        )}
      </TabsContent>

      {/* Assets */}
      <TabsContent value="Assets" className="w-full flex flex-col gap-2">
        {assets.length === 0 ? (
          <p className="text-center py-10 text-sm text-muted-foreground">
            No recent transactions available.
          </p>
        ) : (
          assets.map((asset) => <AssetCard key={asset.id} asset={asset} />)
        )}
      </TabsContent>
    </Tabs>
  );
};

export default HomeTabs;
