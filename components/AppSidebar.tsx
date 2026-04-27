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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { SettingsUser } from "@/app/Types";
import { useTabsContext } from "./TabsProvider";
import Image from "next/image";
import icon from "../app/icon.png";

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
                <div className="flex aspect-square items-center justify-center rounded-lg">
                  <Image src={icon} alt="icon" width={32} height={32} />
                </div>
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
