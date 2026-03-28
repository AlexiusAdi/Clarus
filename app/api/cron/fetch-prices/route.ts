import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAssetByIdentifier } from "@/lib/helper/getAssetByIdentifier";

const IDR_PER_USD = 16350; // fallback — swap with a live FX call if needed
const TROY_OZ_TO_GRAM = 31.1035;

function isAuthorized(req: NextRequest): boolean {
  const secret = req.nextUrl.searchParams.get("secret");
  return secret === process.env.CRON_SECRET;
}

async function fetchGoldPriceIdr(): Promise<number> {
  const res = await fetch("https://api.metals.live/v1/spot/gold", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`metals.live error: ${res.status}`);
  const data = await res.json();
  const usdPerOz: number = Array.isArray(data) ? data[0]?.price : data?.price;
  if (!usdPerOz) throw new Error("No gold price returned");
  return (usdPerOz / TROY_OZ_TO_GRAM) * IDR_PER_USD;
}

async function fetchStockPriceIdr(ticker: string): Promise<number> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok)
    throw new Error(`Yahoo Finance error for ${ticker}: ${res.status}`);
  const data = await res.json();
  const price: number = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
  if (!price) throw new Error(`No price returned for ${ticker}`);
  // IDX stocks (.JK) are already in IDR; US stocks need conversion
  return ticker.endsWith(".JK") ? price : price * IDR_PER_USD;
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

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tracked = await prisma.investment.findMany({
    distinct: ["assetIdentifier"],
    select: { assetIdentifier: true },
  });

  if (tracked.length === 0) {
    return NextResponse.json({ message: "No assets to update" });
  }

  const results: {
    identifier: string;
    status: "ok" | "error";
    error?: string;
  }[] = [];

  for (const { assetIdentifier } of tracked) {
    // Resolve ticker and type from the predefined list
    const asset = getAssetByIdentifier(assetIdentifier);

    if (!asset) {
      results.push({
        identifier: assetIdentifier,
        status: "error",
        error: "Unknown asset — not in predefined list",
      });
      continue;
    }

    try {
      let priceIdr: number;

      if (asset.type === "GOLD") {
        priceIdr = await fetchGoldPriceIdr();
      } else if (asset.type === "STOCK") {
        priceIdr = await fetchStockPriceIdr(asset.ticker);
      } else if (asset.type === "CRYPTO") {
        priceIdr = await fetchCryptoPriceIdr(asset.ticker);
      } else {
        results.push({ identifier: assetIdentifier, status: "ok" });
        continue;
      }

      await prisma.assetPrice.upsert({
        where: { identifier: assetIdentifier },
        update: { priceIdr, updatedAt: new Date() },
        create: { identifier: assetIdentifier, type: asset.type, priceIdr },
      });

      results.push({ identifier: assetIdentifier, status: "ok" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[fetch-prices] Failed for ${assetIdentifier}:`, message);
      results.push({
        identifier: assetIdentifier,
        status: "error",
        error: message,
      });
    }
  }

  return NextResponse.json({ updated: results });
}
