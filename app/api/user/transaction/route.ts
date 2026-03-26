import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { TransactionType } from "@/lib/generated/prisma/enums";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { amount, description, categoryId, type, date } = body;

    // --- Basic validation ---
    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 },
      );
    }

    if (
      !type ||
      ![TransactionType.INCOME, TransactionType.EXPENSE].includes(type)
    ) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // --- Create transaction ---
    const transaction = await prisma.transaction.create({
      data: {
        amount: Number(amount),
        description: description || "",
        type,
        date: new Date(date),

        category: {
          connect: { id: categoryId },
        },

        user: {
          connect: { id: userId },
        },
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("POST /transactions error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
