import NetWorthCard from "@/components/NetWorthCard";
import ThemeToggle from "@/components/ThemeToggle";
import FloatingMenu from "@/components/FloatingMenu";
import HomeTabs from "@/components/HomeTabs";
import { auth } from "@/auth";
import { getUserNetWorth } from "@/lib/helper/getUserNetWorth";
import { getTabsData } from "@/lib/helper/getTabsData";
import { SettingsUser } from "@/app/Types";
import { getCategories } from "@/lib/data/categories";
import { getAssets } from "@/lib/data/assets";
import { getGoals } from "@/lib/data/goals";
import { getInvestments } from "@/lib/data/investments";
import UserMenu from "@/components/UserMenu";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import FloatingNav from "@/components/FloatingNav";
import GoalsContent from "@/components/GoalsContent";

const Page = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const settinguser: SettingsUser = {
    name: session?.user?.name ?? undefined,
    email: session?.user?.email ?? undefined,
    image: session?.user?.image ?? undefined,
  };

  const [categories, assets, goals, investments, netWorth, tabsData] =
    await Promise.all([
      getCategories(userId),
      getAssets(userId),
      getGoals(userId),
      getInvestments(userId),
      getUserNetWorth(userId),
      getTabsData(userId),
    ]);

  return (
    <>
      <AppSidebar user={settinguser} />
      <SidebarInset>
        <div className="@container/main p-4 md:px-10">
          <div className="flex justify-between pb-4">
            <div className="flex items-center justify-center px-4">
              <SidebarTrigger className=" active:scale-125 hidden @4xl/main:block" />
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-2">
              <span className="shadow-sm">Hello, {session?.user?.name}</span>
              <UserMenu user={settinguser} />
            </div>
          </div>
          <div className="@4xl/main:flex @4xl/main:flex-row @4xl/main:gap-4 @3xs/main:pb-20 @4xl/main:pb-0">
            <div className="w-full @4xl/main:w-200 flex flex-col pb-4">
              <FloatingNav
                categories={categories}
                goals={goals}
                assets={assets}
              />
              <div className="@xl/main:hidden">
                <FloatingMenu
                  categories={categories}
                  goals={goals}
                  assets={assets}
                />
              </div>

              <div>
                <NetWorthCard userNetWorth={netWorth} />
                <div className="hidden @4xl/main:block">
                  <GoalsContent goals={goals} />
                </div>
              </div>
            </div>

            <div className="flex w-full">
              <HomeTabs
                tabData={tabsData}
                assets={assets}
                investments={investments}
                categories={categories}
                goals={goals}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  );
};

export default Page;
