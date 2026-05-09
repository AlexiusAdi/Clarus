import NetWorthCard from "@/components/NetWorthCard";
import ThemeToggle from "@/components/ThemeToggle";
import FloatingMenu from "@/components/FloatingMenu";
import HomeTabs from "@/components/HomeTabs";
import { auth } from "@/auth";
import { getUserNetWorth } from "@/lib/helper/getUserNetWorth";
import { SettingsUser } from "@/app/Types";
import { getCategories } from "@/lib/data/categories";
import { getGoals } from "@/lib/data/goals";
import UserMenu from "@/components/UserMenu";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import FloatingNav from "@/components/FloatingNav";
import GoalsContent from "@/components/GoalsContent";
import { getOverviewData } from "@/lib/helper/getOverviewData";
import { getAssets } from "@/lib/data/assets";
import { getScheduledTransactions } from "@/lib/helper/getScheduledTransactions";
import { ScheduledTransactionsProvider } from "@/components/ScheduledTransactionsProvider";
import UpgradeBanner from "@/components/UpgradeBanner";
import { PlanType } from "@/lib/generated/prisma/enums";

const Page = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  const userPlan = session?.user?.plan;

  if (!userId) return null;

  const settinguser: SettingsUser = {
    name: session?.user?.name ?? undefined,
    email: session?.user?.email ?? undefined,
    image: session?.user?.image ?? undefined,
    planType: userPlan ?? PlanType.FREE,
  };

  const isPremium = userPlan !== PlanType.FREE;

  const [
    categories,
    assets,
    goals,
    netWorth,
    overviewData,
    scheduledTransactions,
  ] = await Promise.all([
    getCategories(userId),
    getAssets(userId),
    getGoals(userId),
    getUserNetWorth(userId),
    getOverviewData(userId),
    getScheduledTransactions(userId),
  ]);

  return (
    <>
      <AppSidebar user={settinguser} />
      <SidebarInset>
        <div className="@container/main p-4 md:px-10">
          <div className="flex justify-between pb-4">
            <div className="flex items-center justify-center px-4">
              <SidebarTrigger className=" active:scale-125 hidden @2sm/main:block" />
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Hello, {session?.user?.name}</span>
              <UserMenu user={settinguser} />
            </div>
          </div>
          <ScheduledTransactionsProvider initial={scheduledTransactions}>
            <div className="@3xl/main:flex @3xl/main:flex-row @3xl/main:gap-4 @3xs/main:pb-20 @3xl/main:pb-0">
              <div className="w-full @3xl/main:w-300 flex flex-col pb-4">
                <FloatingNav
                  categories={categories}
                  goals={goals}
                  assets={assets}
                />
                <div className="@2sm/main:hidden">
                  <FloatingMenu
                    categories={categories}
                    goals={goals}
                    assets={assets}
                  />
                </div>

                <div>
                  <NetWorthCard
                    userNetWorth={netWorth}
                    goals={goals}
                    showGoals={isPremium}
                    userPlan={userPlan}
                  />
                  {!isPremium && <UpgradeBanner plan={userPlan} />}
                  <div className="hidden @4xl/main:block">
                    <GoalsContent goals={goals} />
                  </div>
                </div>
              </div>

              <div className="flex w-full">
                <HomeTabs
                  overviewData={overviewData}
                  categories={categories}
                  goals={goals}
                />
              </div>
            </div>
          </ScheduledTransactionsProvider>
        </div>
      </SidebarInset>
    </>
  );
};

export default Page;
