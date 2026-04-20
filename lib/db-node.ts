import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const dbFile = dbUrl.replace(/^file:/, "");

const globalForPrisma = globalThis as unknown as { prismaNode?: PrismaClient };

function createClient() {
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbFile}` });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalForPrisma.prismaNode ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaNode = prisma;
}
