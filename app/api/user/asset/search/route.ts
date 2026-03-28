import { searchAssets } from "@/lib/helper/searchAssets";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type");

  let results = searchAssets(q);

  if (type) {
    results = results.filter((a) => a.type === type);
  }

  return NextResponse.json(results.slice(0, 20));
}
