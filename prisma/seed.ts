import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { prisma } from "../lib/prisma";
import { DEFAULT_CATEGORIES } from "../constants";

async function main() {
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      userId: null,
      isDefault: true,
    })),
    skipDuplicates: true,
  });

  console.log("Seeded global categories");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
