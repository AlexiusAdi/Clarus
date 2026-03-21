"use client";

import SpendingChart from "./SpendingChart";
import SpendingCategories from "./SpendingCategories";
import RecentActivities from "./RecentActivities";
import InvestmentChart from "./InvestmentChart";
import InvestmentCard from "./InvestmentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const HomeTabs = () => {
  return (
    <Tabs defaultValue="overview" className="w-full items-center">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="Transactions">Transactions</TabsTrigger>
        <TabsTrigger value="Investments">Investments</TabsTrigger>
        <TabsTrigger value="Assets">Assets</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="w-full">
        <div className="flex flex-col gap-3">
          <SpendingChart />
          <SpendingCategories />
          <RecentActivities isShown={true} />
        </div>
      </TabsContent>
      <TabsContent value="Transactions" className="w-full">
        <RecentActivities isShown={false} />
      </TabsContent>
      <TabsContent value="Investments" className="w-full flex flex-col gap-2">
        <InvestmentChart />
        <InvestmentCard />
        <InvestmentCard />
        <InvestmentCard />
      </TabsContent>
      <TabsContent value="Assets" className="w-full flex flex-col gap-2">
        <InvestmentCard />
        <InvestmentCard />
        <InvestmentCard />
      </TabsContent>
    </Tabs>
  );
};

export default HomeTabs;
