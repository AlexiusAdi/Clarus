import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import {
  TransactionType,
  AssetType,
  AcquisitionSource,
} from "@/lib/generated/prisma/browser";
import { z } from "zod";
import { canAddAsset, FREE_ASSET_LIMIT, isPro } from "@/lib/helper/plan";

const assetPostSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(AssetType),
  value: z.coerce.number().positive("Value must be greater than 0"),
  acquisitionSource: z.enum(AcquisitionSource).optional(),
  date: z.string().min(1, "Date is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = assetPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { name, type, value, acquisitionSource, date } = parsed.data;

    if (!isPro(session.user.plan)) {
      const assetCount = await prisma.asset.count({ where: { userId } });

      if (!canAddAsset(session.user.plan, assetCount)) {
        return NextResponse.json(
          {
            error: `Free plan is limited to ${FREE_ASSET_LIMIT} assets. Upgrade to Pro for unlimited.`,
          },
          { status: 403 },
        );
      }
    }

    const asset = await prisma.asset.create({
      data: {
        name,
        type,
        value,
        date: new Date(date),
        userId,
        acquisitionSource,
      },
    });

    await prisma.transaction.create({
      data: {
        type: TransactionType.ASSETS,
        amount: value,
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
