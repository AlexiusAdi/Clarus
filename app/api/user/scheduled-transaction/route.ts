import { auth } from "@/auth";
import { Frequency, TransactionType } from "@/lib/generated/prisma/browser";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  amount: z.string().refine((v) => parseFloat(v) > 0),
  type: z.enum(TransactionType),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  frequency: z.enum(Frequency),
  interval: z.number().min(1).max(365).default(1),
  startDate: z.string(), // "yyyy-MM-dd"
});

// POST — create
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createSchema.parse(body);

    const startDate = new Date(data.startDate);

    const scheduled = await prisma.scheduledTransaction.create({
      data: {
        userId: session.user.id,
        amount: parseFloat(data.amount),
        type: data.type,
        categoryId: data.categoryId,
        description: data.description,
        frequency: data.frequency,
        interval: data.interval,
        startDate,
        nextRunDate: startDate, // first run = startDate
        isActive: true,
      },
    });

    return NextResponse.json(scheduled, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET — list all for current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const scheduled = await prisma.scheduledTransaction.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(scheduled);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
