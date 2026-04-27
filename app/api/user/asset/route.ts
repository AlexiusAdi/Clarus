import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { TransactionType } from "@/lib/generated/prisma/browser";

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

    await prisma.transaction.create({
      data: {
        type: TransactionType.ASSETS,
        amount: parsed,
        date: new Date(date),
        user: { connect: { id: userId } },
        assets: { connect: { id: asset.id } },
        description: asset.name,
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

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));

    // Get pageSize from UserDetail instead of query param
    const userDetail = await prisma.userDetail.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const pageSize = userDetail.pageSize;

    const [raw, total] = await Promise.all([
      prisma.asset.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.asset.count({ where: { userId } }),
    ]);

    const data = raw.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      value: a.value.toNumber(),
      date: a.date,
      createdAt: a.createdAt,
      acquisitionSource: a.acquisitionSource,
    }));

    return NextResponse.json({ data, total, page, pageSize });
  } catch (error) {
    console.error("GET /asset error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
