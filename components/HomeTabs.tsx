"use client";

import SpendingChart from "./SpendingChart";
import SpendingCategories from "./SpendingCategories";
import RecentActivities from "./RecentActivities";
import InvestmentChart from "./InvestmentChart";
import InvestmentCard from "./InvestmentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { TabsData } from "@/app/Types";

const HomeTabs = ({ tabData }: { tabData: TabsData }) => {
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
        <InvestmentChart />
        <InvestmentCard />
        <InvestmentCard />
        <InvestmentCard />
      </TabsContent>

      {/* Assets */}
      <TabsContent value="Assets" className="w-full flex flex-col gap-2">
        <InvestmentCard />
        <InvestmentCard />
        <InvestmentCard />
      </TabsContent>
    </Tabs>
  );
};

export default HomeTabs;
