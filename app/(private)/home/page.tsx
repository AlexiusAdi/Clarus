import NetWorthCard from "@/components/NetWorthCard";
import ThemeToggle from "@/components/ThemeToggle";
import FloatingMenu from "@/components/FloatingMenu";
import HomeTabs from "@/components/HomeTabs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getUserNetWorth } from "@/lib/getUserNetWorth";
import { getTabsData } from "@/lib/getTabsData";
import { SettingsUser } from "@/app/Types";

const Page = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const settinguser: SettingsUser = {
    name: session?.user?.name,
    email: session?.user?.email,
    image: session?.user?.image,
  };

  const categories = await prisma.category.findMany({
    where: { userId },
  });

  const assets = await prisma.asset.findMany({
    where: { userId },
  });

  const goals = await prisma.goal.findMany({
    where: { userId },
  });

  const netWorth = await getUserNetWorth(userId);
  const tabsData = await getTabsData(userId);

  return (
    <div className="@container/main w-screen mb-20 p-4">
      <FloatingMenu
        categories={categories}
        goals={goals}
        assets={assets}
        user={settinguser}
      />
      <div className="w-full flex flex-col text-right pb-4">
        <ThemeToggle />
        <span>Hello, {session?.user?.name}</span>
      </div>
      <NetWorthCard userNetWorth={netWorth} />

      <div className="flex w-full">
        <HomeTabs tabData={tabsData} assets={assets} />
      </div>
    </div>
  );
};

export default Page;
