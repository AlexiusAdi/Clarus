"use client";

import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  Landmark,
  Target,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { SettingsUser } from "@/app/Types";
import { useTabsContext } from "./TabsProvider";

const navMain = [
  { tab: "overview", label: "Overview", icon: LayoutDashboard },
  { tab: "Transactions", label: "Transactions", icon: ArrowLeftRight },
  { tab: "Investments", label: "Investments", icon: TrendingUp },
  { tab: "Assets", label: "Assets", icon: Landmark },
];

const navPlanning = [{ href: "/goals", label: "Goals", icon: Target }];

export function AppSidebar({ user }: { user: SettingsUser }) {
  const { activeTab, setActiveTab } = useTabsContext();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-foreground text-background">
                  <span className="text-sm font-semibold">C</span>
                </div>
                <span className="font-semibold">Clarus</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map(({ tab, label, icon: Icon }) => (
                <SidebarMenuItem key={tab}>
                  <SidebarMenuButton
                    isActive={activeTab === tab}
                    tooltip={label}
                    onClick={() => setActiveTab(tab)}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
