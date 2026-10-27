-- DropIndex
DROP INDEX "Todo_userId_createdAt_idx";

-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "weekday" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Todo_userId_weekday_createdAt_idx" ON "Todo"("userId", "weekday", "createdAt");
