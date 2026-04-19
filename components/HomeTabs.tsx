"use client";

import SpendingChart from "./SpendingChart";
import SpendingCategories from "./SpendingCategories";
import RecentActivities from "./RecentActivities";
import InvestmentChart from "./InvestmentChart";
import InvestmentCard from "./InvestmentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AssetCard } from "./AssetCard";
import { AssetDTO } from "@/lib/data/assets";
import { InvestmentDTO } from "@/lib/data/investments";
import { TabsDataDTO } from "@/lib/helper/getTabsData";
import { Category } from "@/lib/generated/prisma/browser";
import { GoalDTO } from "@/lib/data/goals";
import { useTabsContext } from "./TabsProvider";

const HomeTabs = ({
  tabData,
  assets,
  investments,
  categories,
  goals,
}: {
  tabData: TabsDataDTO;
  assets: AssetDTO[];
  investments: InvestmentDTO[];
  categories: Category[];
  goals: GoalDTO[];
}) => {
  const { transactions, currentMonthTotal, topSpending, spendingByCategory } =
    tabData;
  const { activeTab, setActiveTab } = useTabsContext();

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      defaultValue="overview"
      className="w-full items-center"
    >
      <div className="@xs/main:hidden">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="Transactions">Transactions</TabsTrigger>
          <TabsTrigger value="Investments">Investments</TabsTrigger>
          <TabsTrigger value="Assets">Assets</TabsTrigger>
        </TabsList>
      </div>
      {/* ✅ Overview */}
      <TabsContent value="overview" className="w-full">
        <div className="flex flex-col gap-3">
          {tabData.transactions.length === 0 ? (
            <p className="text-center py-10 text-sm text-muted-foreground">
              No recent transactions available.
            </p>
          ) : (
            <>
              <SpendingChart data={spendingByCategory} />
              <SpendingCategories
                data={spendingByCategory}
                totalExpense={currentMonthTotal}
              />
              <RecentActivities
                data={topSpending}
                isShown={true}
                categories={categories}
                goals={goals}
              />
            </>
          )}
        </div>
      </TabsContent>

      {/* ✅ Transactions */}
      <TabsContent value="Transactions" className="w-full">
        <RecentActivities
          data={transactions}
          isShown={false}
          categories={categories}
          goals={goals}
        />
      </TabsContent>

      {/* Investments */}
      <TabsContent value="Investments" className="w-full flex flex-col gap-2">
        {investments.length === 0 ? (
          <p className="text-center py-10 text-sm text-muted-foreground">
            No recent investments available.
          </p>
        ) : (
          <>
            <InvestmentChart investments={investments} />
            {investments.map((investment) => (
              <InvestmentCard key={investment.id} investment={investment} />
            ))}
          </>
        )}
      </TabsContent>

      {/* Assets */}
      <TabsContent value="Assets" className="w-full flex flex-col gap-2">
        {assets.length === 0 ? (
          <p className="text-center py-10 text-sm text-muted-foreground">
            No recent assets available.
          </p>
        ) : (
          assets.map((asset) => <AssetCard key={asset.id} asset={asset} />)
        )}
      </TabsContent>
    </Tabs>
  );
};

export default HomeTabs;
