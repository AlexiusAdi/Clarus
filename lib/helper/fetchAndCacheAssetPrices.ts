import { prisma } from "@/lib/prisma";
import { getAssetByIdentifier } from "@/lib/helper/getAssetByIdentifier";

/**
 * Only used when the live USD/IDR lookup fails. Prices converted at this rate
 * drift further from reality the longer it sits here, so treat a run that logs
 * the fallback as a warning, not a normal outcome.
 */
const IDR_PER_USD_FALLBACK = 16350;
const TROY_OZ_TO_GRAM = 31.1035;

const YAHOO_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Accept: "application/json",
};

async function fetchIdrPerUsd(): Promise<number> {
  try {
    const res = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/IDR=X?interval=1d&range=1d",
      { cache: "no-store", headers: YAHOO_HEADERS },
    );
    if (!res.ok) throw new Error(`Yahoo FX error: ${res.status}`);
    const data = await res.json();
    const rate: number = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    if (!rate || rate <= 0) throw new Error("No USD/IDR rate returned");
    return rate;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[fetch-prices] USD/IDR lookup failed, falling back to ${IDR_PER_USD_FALLBACK}:`,
      message,
    );
    return IDR_PER_USD_FALLBACK;
  }
}

async function fetchGoldPriceIdr(idrPerUsd: number): Promise<number> {
  const res = await fetch(
    "https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=1d",
    { cache: "no-store", headers: YAHOO_HEADERS },
  );
  if (!res.ok) throw new Error(`yahoo error: ${res.status}`);
  const data = await res.json();
  const usdPerOz = data.chart.result[0].meta.regularMarketPrice;
  if (!usdPerOz) throw new Error("No gold price returned");
  return (usdPerOz / TROY_OZ_TO_GRAM) * idrPerUsd;
}

async function fetchStockPriceIdr(
  ticker: string,
  getIdrPerUsd: () => Promise<number>,
): Promise<number> {
  const encodedTicker = encodeURIComponent(ticker);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodedTicker}?interval=1d&range=1d`;
  const res = await fetch(url, { cache: "no-store", headers: YAHOO_HEADERS });
  if (!res.ok)
    throw new Error(`Yahoo Finance error for ${ticker}: ${res.status}`);
  const data = await res.json();
  const price: number = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
  if (!price) throw new Error(`No price returned for ${ticker}`);
  // .JK tickers are already quoted in IDR; everything else is USD, so the FX
  // lookup only happens for the tickers that actually need it.
  return ticker.endsWith(".JK") ? price : price * (await getIdrPerUsd());
}

async function fetchCryptoPriceIdr(coinId: string): Promise<number> {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=idr`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`CoinGecko error for ${coinId}: ${res.status}`);
  const data = await res.json();
  const price: number = data?.[coinId]?.idr;
  if (!price) throw new Error(`No IDR price returned for ${coinId}`);
  return price;
}

/**
 * Refresh cached IDR prices.
 *
 * With no argument this refreshes every known asset — the nightly cron path.
 * Pass `identifiers` only to seed a specific, just-created asset; never to
 * narrow the cron down to assets users happen to hold.
 */
export async function fetchAndCacheAssetPrices(identifiers?: string[]) {
  // Query AssetPrice table directly — seeded from PREDEFINED_ASSETS
  // so we always fetch prices for all known assets, not just user holdings
  const tracked = identifiers
    ? identifiers.map((identifier) => ({ identifier }))
    : await prisma.assetPrice.findMany({ select: { identifier: true } });

  if (tracked.length === 0) return { updated: [], idrPerUsd: null };

  const results: {
    identifier: string;
    status: "ok" | "error";
    error?: string;
  }[] = [];

  // Looked up at most once per run, and only if something actually needs
  // converting — a crypto-only seed never touches the FX endpoint.
  let idrPerUsdPromise: Promise<number> | null = null;
  const getIdrPerUsd = () => (idrPerUsdPromise ??= fetchIdrPerUsd());

  for (const { identifier } of tracked) {
    const asset = getAssetByIdentifier(identifier);

    if (!asset) {
      results.push({
        identifier,
        status: "error",
        error: "Unknown asset — not in predefined list",
      });
      continue;
    }

    try {
      let priceIdr: number;

      if (asset.type === "GOLD") {
        priceIdr = await fetchGoldPriceIdr(await getIdrPerUsd());
      } else if (asset.type === "STOCK") {
        priceIdr = await fetchStockPriceIdr(asset.ticker, getIdrPerUsd);
      } else if (asset.type === "CRYPTO") {
        priceIdr = await fetchCryptoPriceIdr(asset.ticker);
      } else {
        // OTHER — skip price fetch
        results.push({ identifier, status: "ok" });
        continue;
      }

      await prisma.assetPrice.upsert({
        where: { identifier },
        update: { priceIdr, updatedAt: new Date() },
        create: { identifier, type: asset.type, priceIdr },
      });

      results.push({ identifier, status: "ok" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[fetch-prices] Failed for ${identifier}:`, message);
      results.push({ identifier, status: "error", error: message });
    }
  }

  return {
    updated: results,
    // null when nothing in this run needed a USD conversion.
    idrPerUsd: idrPerUsdPromise ? await idrPerUsdPromise : null,
  };
}
