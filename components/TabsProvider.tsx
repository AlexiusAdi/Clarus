// context/TabsContext.tsx
"use client";

import { createContext, useContext, useState } from "react";

type TabsContextType = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settingsVersion: number;
  bumpSettingsVersion: () => void;
  refetchActive: () => void; // ← add
  setRefetchActive: (fn: () => void) => void; // ← add
};

const TabsContext = createContext<TabsContextType>({
  activeTab: "overview",
  setActiveTab: () => {},
  settingsVersion: 0,
  bumpSettingsVersion: () => {},
  refetchActive: () => {},
  setRefetchActive: () => {},
});

export const TabsProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [settingsVersion, setSettingsVersion] = useState(0);
  const bumpSettingsVersion = () => setSettingsVersion((v) => v + 1);
  const [refetchActive, setRefetchActive] = useState<() => void>(() => {});

  return (
    <TabsContext.Provider
      value={{
        activeTab,
        setActiveTab,
        settingsVersion,
        bumpSettingsVersion,
        refetchActive,
        setRefetchActive,
      }}
    >
      {children}
    </TabsContext.Provider>
  );
};

export const useTabsContext = () => useContext(TabsContext);
