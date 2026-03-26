import { StaticImport } from "next/dist/shared/lib/get-img-props";

export type IncomeCardProps = {
  header: string;
  amount: number;
  className?: string;
  icon?: React.ReactNode;
  isVisible: boolean;
};

export interface UserNetWorth {
  totalIncome: number;
  totalExpense: number;
  netWorth: number;
  cashBalance: number;
  totalInvestments: number;
}

export type TabsData = {
  transactions: {
    id: string;
    amount: number;
    type: string;
    date: Date;
    category: { name: string } | null;
    description: string | null;
  }[];
  currentMonthTotal: number; // ← only this added
  topSpending: {
    id: string;
    amount: number;
    type: string;
    date: Date;
    category: { name: string } | null;
    description: string | null;
  }[];
  spendingByCategory: {
    category: string;
    amount: number;
  }[];
};

export interface SpendingChartProps {
  data: {
    category: string;
    amount: number;
  }[];
}

export interface SettingsUser {
  id?: string;
  name?: string;
  email?: string;
  image?: string | Blob | undefined;
}

// lib/assets/predefined.ts
//
// Master list of all assets users can track in Clarus.
// - identifier: the key stored in Investment.assetIdentifier and AssetPrice.identifier
// - ticker:     what gets passed to the price-fetch API (Yahoo Finance / CoinGecko)
// - label:      display name shown in the UI
// - type:       matches InvestmentType enum
// - exchange:   informational, shown as a badge in the dropdown
//
// To add more assets over time, just append to the relevant section.

export interface PredefinedAsset {
  identifier: string;
  ticker: string;
  label: string;
  type: "GOLD" | "STOCK" | "CRYPTO" | "OTHER";
  exchange?: string;
  unit: string; // default unit for this asset
}

export const PREDEFINED_ASSETS: PredefinedAsset[] = [
  // ── Gold ────────────────────────────────────────────────────────────────────
  {
    identifier: "gold",
    ticker: "gold", // handled by metals.live, not Yahoo Finance
    label: "Gold",
    type: "GOLD",
    unit: "gram",
  },

  // ── IDX Blue Chips ───────────────────────────────────────────────────────────
  {
    identifier: "BBCA.JK",
    ticker: "BBCA.JK",
    label: "Bank Central Asia",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "BBRI.JK",
    ticker: "BBRI.JK",
    label: "Bank Rakyat Indonesia",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "BMRI.JK",
    ticker: "BMRI.JK",
    label: "Bank Mandiri",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "TLKM.JK",
    ticker: "TLKM.JK",
    label: "Telkom Indonesia",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "ASII.JK",
    ticker: "ASII.JK",
    label: "Astra International",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "GOTO.JK",
    ticker: "GOTO.JK",
    label: "GoTo Gojek Tokopedia",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "BYAN.JK",
    ticker: "BYAN.JK",
    label: "Bayan Resources",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "UNVR.JK",
    ticker: "UNVR.JK",
    label: "Unilever Indonesia",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "ICBP.JK",
    ticker: "ICBP.JK",
    label: "Indofood CBP",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "KLBF.JK",
    ticker: "KLBF.JK",
    label: "Kalbe Farma",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "INDF.JK",
    ticker: "INDF.JK",
    label: "Indofood Sukses Makmur",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "SMGR.JK",
    ticker: "SMGR.JK",
    label: "Semen Indonesia",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "ANTM.JK",
    ticker: "ANTM.JK",
    label: "Aneka Tambang (Antam)",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "PTBA.JK",
    ticker: "PTBA.JK",
    label: "Bukit Asam",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "ADRO.JK",
    ticker: "ADRO.JK",
    label: "Adaro Energy",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "EXCL.JK",
    ticker: "EXCL.JK",
    label: "XL Axiata",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "PGAS.JK",
    ticker: "PGAS.JK",
    label: "Perusahaan Gas Negara",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "JSMR.JK",
    ticker: "JSMR.JK",
    label: "Jasa Marga",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "WSKT.JK",
    ticker: "WSKT.JK",
    label: "Waskita Karya",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },
  {
    identifier: "PWON.JK",
    ticker: "PWON.JK",
    label: "Pakuwon Jati",
    type: "STOCK",
    exchange: "IDX",
    unit: "lot",
  },

  // ── US Stocks ────────────────────────────────────────────────────────────────
  // Note: US stock prices from Yahoo Finance are in USD — converted to IDR in fetch-prices
  {
    identifier: "AAPL",
    ticker: "AAPL",
    label: "Apple",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "MSFT",
    ticker: "MSFT",
    label: "Microsoft",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "GOOGL",
    ticker: "GOOGL",
    label: "Alphabet (Google)",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "NVDA",
    ticker: "NVDA",
    label: "NVIDIA",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "AMZN",
    ticker: "AMZN",
    label: "Amazon",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "META",
    ticker: "META",
    label: "Meta Platforms",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "TSLA",
    ticker: "TSLA",
    label: "Tesla",
    type: "STOCK",
    exchange: "NASDAQ",
    unit: "share",
  },
  {
    identifier: "BRK-B",
    ticker: "BRK-B",
    label: "Berkshire Hathaway B",
    type: "STOCK",
    exchange: "NYSE",
    unit: "share",
  },
  {
    identifier: "JPM",
    ticker: "JPM",
    label: "JPMorgan Chase",
    type: "STOCK",
    exchange: "NYSE",
    unit: "share",
  },
  {
    identifier: "V",
    ticker: "V",
    label: "Visa",
    type: "STOCK",
    exchange: "NYSE",
    unit: "share",
  },

  // ── Crypto ───────────────────────────────────────────────────────────────────
  // CoinGecko IDs (not symbols) are used as identifiers
  {
    identifier: "bitcoin",
    ticker: "bitcoin",
    label: "Bitcoin",
    type: "CRYPTO",
    unit: "coin",
  },
  {
    identifier: "ethereum",
    ticker: "ethereum",
    label: "Ethereum",
    type: "CRYPTO",
    unit: "coin",
  },
];

// ── Lookup helpers ────────────────────────────────────────────────────────────

export function getAssetByIdentifier(
  identifier: string,
): PredefinedAsset | undefined {
  return PREDEFINED_ASSETS.find((a) => a.identifier === identifier);
}

export function searchAssets(query: string): PredefinedAsset[] {
  const q = query.toLowerCase().trim();
  if (!q) return PREDEFINED_ASSETS;
  return PREDEFINED_ASSETS.filter(
    (a) =>
      a.label.toLowerCase().includes(q) ||
      a.identifier.toLowerCase().includes(q) ||
      a.exchange?.toLowerCase().includes(q),
  );
}
