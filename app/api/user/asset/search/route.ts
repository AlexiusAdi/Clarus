// app/api/assets/search/route.ts
//
// Simple search endpoint for the investment form dropdown.
// Filters the predefined asset list — no DB query needed.
//
// GET /api/assets/search?q=bbca
// GET /api/assets/search?q=apple
// GET /api/assets/search?type=STOCK

import { searchAssets } from "@/lib/helper/searchAssets";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type"); // optional filter by type

  let results = searchAssets(q);

  if (type) {
    results = results.filter((a) => a.type === type);
  }

  // Cap at 20 results for the dropdown
  return NextResponse.json(results.slice(0, 20));
}
