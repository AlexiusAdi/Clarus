// app/api/import/route.ts
import { IMPORT_LIMITS } from "@/constants/plans";
import { auth } from "@/auth";
import { TransactionType } from "@/lib/generated/prisma/browser";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { z } from "zod";

// ── Row schema ───────────────────────────────────────────────────────────────
const RowSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD"),
  amount: z
    .union([z.string(), z.number()])
    .transform((v) => parseFloat(String(v)))
    .refine((v) => !isNaN(v) && v > 0, "must be a positive number"),
  type: z.enum(["INCOME", "EXPENSE"] as const, {
    error: "must be INCOME or EXPENSE",
  }),
  category: z.string().min(1, "required"),
  description: z.string().max(255).optional().default(""),
});

type ImportRow = z.infer<typeof RowSchema>;

// ── POST /api/import ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Auth
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // 2. Plan check — plan is on User, not UserDetail
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  const plan = user?.plan ?? "FREE";
  const limit = IMPORT_LIMITS[plan] ?? 0;

  if (limit === 0) {
    return NextResponse.json(
      {
        message:
          "Import is not available on the Free plan. Upgrade to Pro or Elite.",
      },
      { status: 403 },
    );
  }

  // 3. Parse multipart file
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ message: "No file provided" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext !== "xlsx" && ext !== "csv") {
    return NextResponse.json(
      { message: "Only .xlsx and .csv files are supported" },
      { status: 400 },
    );
  }

  // 4. Parse workbook
  let rows: Record<string, unknown>[];
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: false });
    // Prefer sheet named "Import", fall back to first sheet
    const sheetName =
      workbook.SheetNames.find((n) => n.toLowerCase() === "import") ??
      workbook.SheetNames[0];
    rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: "",
      raw: false, // coerce all values to strings — safer for date/amount parsing
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "Could not read the file. Make sure it's a valid .xlsx or .csv.",
      },
      { status: 400 },
    );
  }

  if (rows.length === 0) {
    return NextResponse.json({ message: "File is empty" }, { status: 400 });
  }

  // 5. Row limit check (server-enforced)
  if (rows.length > limit) {
    return NextResponse.json(
      {
        message: `Your ${plan} plan allows up to ${limit.toLocaleString()} rows per import. This file has ${rows.length.toLocaleString()} rows.`,
      },
      { status: 422 },
    );
  }

  // 6. Validate all rows — collect errors, don't fail fast
  const validRows: ImportRow[] = [];
  const rowErrors: { row: number; errors: string[] }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const result = RowSchema.safeParse(rows[i]);
    if (result.success) {
      validRows.push(result.data);
    } else {
      rowErrors.push({
        row: i + 2, // +2: header row + 1-based
        errors: result.error.issues.map(
          (e) => `${String(e.path[0])}: ${e.message}`,
        ),
      });
    }
  }

  if (rowErrors.length > 0) {
    return NextResponse.json(
      {
        message: `${rowErrors.length} row(s) failed validation.`,
        errors: rowErrors.slice(0, 20),
      },
      { status: 422 },
    );
  }

  // 7. Resolve categories — must match name + type together (@@unique constraint)
  //    Build unique (name, type) pairs to avoid false matches
  const uniquePairs = [
    ...new Map(
      validRows.map((r) => [
        `${r.category}__${r.type}`,
        { name: r.category, type: r.type as TransactionType },
      ]),
    ).values(),
  ];

  const categories = await prisma.category.findMany({
    where: {
      OR: uniquePairs.map((p) => ({
        name: p.name,
        type: p.type,
        OR: [{ userId }, { userId: null }],
      })),
    },
    select: { id: true, name: true, type: true },
  });

  // Map key: "categoryName__TYPE"
  const categoryMap = new Map(
    categories.map((c) => [`${c.name}__${c.type}`, c.id]),
  );

  const missing = uniquePairs.filter(
    (p) => !categoryMap.has(`${p.name}__${p.type}`),
  );

  if (missing.length > 0) {
    return NextResponse.json(
      {
        message: `These category + type combinations don't exist in Clarus: ${missing
          .map((p) => `"${p.name}" (${p.type})`)
          .join(", ")}. Create them first or fix the spelling.`,
      },
      { status: 422 },
    );
  }

  // 8. Build transaction payloads
  const payload = validRows.map((r) => ({
    userId,
    categoryId: categoryMap.get(`${r.category}__${r.type}`)!,
    type: r.type as TransactionType,
    amount: r.amount,
    date: new Date(r.date),
    description: r.description || null,
  }));

  // 9. Insert in batches of 100
  let imported = 0;
  try {
    for (let i = 0; i < payload.length; i += 100) {
      const result = await prisma.transaction.createMany({
        data: payload.slice(i, i + 100),
        skipDuplicates: true,
      });
      imported += result.count;
    }
  } catch {
    return NextResponse.json(
      { message: "Database error while importing. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ imported }, { status: 200 });
}
