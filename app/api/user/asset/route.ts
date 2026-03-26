import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, type, value, acquisitionSource, date } = body;

    const parsed = parseFloat(value);
    console.log("Parsed value:", parsed);
    if (!value || isNaN(parsed)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!name || !type || !value || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const asset = await prisma.asset.create({
      data: {
        name,
        type,
        value: parsed,
        date: new Date(date),
        userId,
        acquisitionSource: acquisitionSource,
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error("POST /asset error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
