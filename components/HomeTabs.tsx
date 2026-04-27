"use client";

import SpendingChart from "./SpendingChart";
import SpendingCategories from "./SpendingCategories";
import RecentActivities from "./RecentActivities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { OverviewDataDTO } from "@/lib/helper/getOverviewData";
import { Category } from "@/lib/generated/prisma/browser";
import { GoalDTO } from "@/lib/data/goals";
import { useTabsContext } from "./TabsProvider";
import { TransactionDTO } from "@/lib/helper/getOverviewData";
import { PaginationControls } from "./PaginationControls";
import { TransactionCardSkeleton } from "./skeleton/TransacrionCardSkeleton";
import { AssetDTO } from "@/lib/data/assets";
import { AssetCard } from "./AssetCard";
import { AssetCardSkeleton } from "./skeleton/AssetCardSkeleton";
import { InvestmentDTO } from "@/lib/data/investments";
import InvestmentChart from "./InvestmentChart";
import InvestmentCard from "./InvestmentCard";
import { InvestmentCardSkeleton } from "./skeleton/InvestmentCardSkeleton";
import { useTabData } from "@/hooks/useTabData";
import { useEffect } from "react";

const HomeTabs = ({
  overviewData,
  categories,
  goals,
}: {
  overviewData: OverviewDataDTO;
  categories: Category[];
  goals: GoalDTO[];
}) => {
  const { currentMonthTotal, topSpending, spendingByCategory } = overviewData;
  const { activeTab, setActiveTab, settingsVersion } = useTabsContext();
  const { refetchActive, setRefetchActive } = useTabsContext();

  const {
    data: transactions,
    totalPages,
    page,
    pageSize,
    initialLoading,
    visible,
    handlePageChange,
    refetch: refetchTransactions,
  } = useTabData<TransactionDTO>(
    "Transactions",
    activeTab,
    "/api/user/transaction",
    settingsVersion,
  );

  const {
    data: assets,
    totalPages: assetTotalPages,
    page: assetPage,
    pageSize: assetPageSize,
    initialLoading: assetInitialLoading,
    visible: assetVisible,
    handlePageChange: handleAssetPageChange,
    refetch: refetchAssets,
  } = useTabData<AssetDTO>(
    "Assets",
    activeTab,
    "/api/user/asset",
    settingsVersion,
  );

  const {
    data: investments,
    totalPages: investmentTotalPages,
    page: investmentPage,
    pageSize: investmentPageSize,
    initialLoading: investmentInitialLoading,
    visible: investmentVisible,
    handlePageChange: handleInvestmentPageChange,
    refetch: refetchInvestments,
  } = useTabData<InvestmentDTO>(
    "Investments",
    activeTab,
    "/api/user/investment",
    settingsVersion,
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  useEffect(() => {
    if (activeTab === "Transactions")
      setRefetchActive(() => refetchTransactions);
    if (activeTab === "Assets") setRefetchActive(() => refetchAssets);
    if (activeTab === "Investments") setRefetchActive(() => refetchInvestments);
    else if (activeTab === "overview") {
      setRefetchActive(() => refetchTransactions);
    }
  }, [activeTab]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      defaultValue="overview"
      className="w-full items-center"
    >
      <div className="@md/main:hidden">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="Transactions">Transactions</TabsTrigger>
          <TabsTrigger value="Investments">Investments</TabsTrigger>
          <TabsTrigger value="Assets">Assets</TabsTrigger>
        </TabsList>
      </div>

      {/* Overview */}
      <TabsContent value="overview" className="w-full">
        <div className="flex flex-col gap-3">
          {topSpending.length === 0 ? (
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

      <TabsContent value="Transactions" className="w-full min-h-150">
        {initialLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: pageSize }).map((_, i) => (
              <TransactionCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div
            className={`transition-all duration-150 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
          >
            <RecentActivities
              data={transactions}
              isShown={false}
              categories={categories}
              goals={goals}
            />
            <PaginationControls
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </TabsContent>

      <TabsContent
        value="Investments"
        className="w-full flex flex-col gap-2 min-h-150"
      >
        {investmentInitialLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: investmentPageSize }).map((_, i) => (
              <InvestmentCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div
            className={`flex flex-col gap-2 transition-all duration-150 ${
              investmentVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
          >
            {investments.length === 0 ? (
              <p className="text-center py-10 text-sm text-muted-foreground">
                No investments available.
              </p>
            ) : (
              <>
                <InvestmentChart investments={investments} />
                {investments.map((investment) => (
                  <InvestmentCard key={investment.id} investment={investment} />
                ))}
              </>
            )}
            <PaginationControls
              page={investmentPage}
              totalPages={investmentTotalPages}
              onPageChange={handleInvestmentPageChange}
            />
          </div>
        )}
      </TabsContent>

      <TabsContent
        value="Assets"
        className="w-full flex flex-col gap-2 min-h-150"
      >
        {assetInitialLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: assetPageSize }).map((_, i) => (
              <AssetCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div
            className={`flex flex-col gap-2 transition-all duration-150 ${
              assetVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
          >
            {assets.length === 0 ? (
              <p className="text-center py-10 text-sm text-muted-foreground">
                No assets available.
              </p>
            ) : (
              assets.map((asset) => <AssetCard key={asset.id} asset={asset} />)
            )}
            <PaginationControls
              page={assetPage}
              totalPages={assetTotalPages}
              onPageChange={handleAssetPageChange}
            />
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default HomeTabs;
