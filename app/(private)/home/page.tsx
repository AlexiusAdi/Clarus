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
    <div className="@container/main w-screen mb-20 p-4">
      <FloatingMenu categories={categories} goals={goals} assets={assets} />
      <div className="w-full flex flex-col text-right pb-4">
        <ThemeToggle />
        <div className="flex justify-end gap-2 items-center">
          <span>Hello, {session?.user?.name}</span>

          <UserMenu user={settinguser} />
        </div>
      </div>
      <NetWorthCard userNetWorth={netWorth} />

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
  );
};

export default Page;
