import { NextRequest, NextResponse } from "next/server";
import { fetchAndCacheAssetPrices } from "@/lib/helper/fetchAndCacheAssetPrices";

function isAuthorized(req: NextRequest): boolean {
  return (
    req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`
  );
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await fetchAndCacheAssetPrices();
  return NextResponse.json(result);
}
