// context/TabsContext.tsx
"use client";

import { createContext, useContext, useState } from "react";

type TabsContextType = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settingsVersion: number;
  bumpSettingsVersion: () => void;
  refetchActive: () => void;
  setRefetchActive: (fn: () => void) => void;
  /** Drops a row from the active tab's list immediately, before the server call. */
  removeActiveItem: (id: string) => void;
  setRemoveActiveItem: (fn: (id: string) => void) => void;
};

const TabsContext = createContext<TabsContextType>({
  activeTab: "overview",
  setActiveTab: () => {},
  settingsVersion: 0,
  bumpSettingsVersion: () => {},
  refetchActive: () => {},
  setRefetchActive: () => {},
  removeActiveItem: () => {},
  setRemoveActiveItem: () => {},
});

export const TabsProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [settingsVersion, setSettingsVersion] = useState(0);
  const bumpSettingsVersion = () => setSettingsVersion((v) => v + 1);
  const [refetchActive, setRefetchActive] = useState<() => void>(() => {});
  const [removeActiveItem, setRemoveActiveItem] = useState<(id: string) => void>(
    () => () => {},
  );

  return (
    <TabsContext.Provider
      value={{
        activeTab,
        setActiveTab,
        settingsVersion,
        bumpSettingsVersion,
        refetchActive,
        setRefetchActive,
        removeActiveItem,
        setRemoveActiveItem,
      }}
    >
      {children}
    </TabsContext.Provider>
  );
};

export const useTabsContext = () => useContext(TabsContext);
