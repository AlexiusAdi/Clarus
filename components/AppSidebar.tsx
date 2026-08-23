"use client";

import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  Landmark,
  Target,
  Users,
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
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { SettingsUser } from "@/app/Types";
import { useTabsContext } from "./TabsProvider";
import Image from "next/image";
import icon from "../app/icon.png";
import { usePathname } from "next/navigation";

const navMain = [
  { tab: "overview", label: "Overview", icon: LayoutDashboard },
  { tab: "Transactions", label: "Transactions", icon: ArrowLeftRight },
  { tab: "Investments", label: "Investments", icon: TrendingUp },
  { tab: "Assets", label: "Assets", icon: Landmark },
];

const navPlanning = [
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/groups", label: "Groups", icon: Users, badge: "Elite" },
];

export function AppSidebar({ user }: { user: SettingsUser }) {
  const { activeTab, setActiveTab } = useTabsContext();
  const pathname = usePathname();

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
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.13em]">
            Overview
          </SidebarGroupLabel>
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

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.13em]">
            Planning
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navPlanning.map(({ href, label, icon: Icon, badge }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === href}
                    tooltip={label}
                  >
                    <Link href={href} className="justify-between">
                      <span className="flex items-center gap-2">
                        <Icon />
                        <span>{label}</span>
                      </span>
                      {badge && (
                        <span className="text-[9px] font-bold uppercase tracking-[0.04em] bg-amber-soft text-amber border border-amber/25 px-1.5 py-0.5 rounded-full">
                          {badge}
                        </span>
                      )}
                    </Link>
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
