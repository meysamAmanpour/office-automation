/*
  Warnings:

  - You are about to drop the column `description` on the `Letter` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `Letter` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Letter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "letterNumber" TEXT,
    "subject" TEXT NOT NULL,
    "body" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "creatorId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "departmentId" TEXT,
    "senderName" TEXT,
    "senderOrganization" TEXT,
    "receiverName" TEXT,
    "receiverOrganization" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Letter_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Letter_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Letter_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Letter" ("companyId", "createdAt", "creatorId", "id", "priority", "status", "subject", "type", "updatedAt") SELECT "companyId", "createdAt", "creatorId", "id", "priority", "status", "subject", "type", "updatedAt" FROM "Letter";
DROP TABLE "Letter";
ALTER TABLE "new_Letter" RENAME TO "Letter";
CREATE INDEX "Letter_companyId_idx" ON "Letter"("companyId");
CREATE INDEX "Letter_departmentId_idx" ON "Letter"("departmentId");
CREATE INDEX "Letter_creatorId_idx" ON "Letter"("creatorId");
CREATE INDEX "Letter_status_idx" ON "Letter"("status");
CREATE INDEX "Letter_type_idx" ON "Letter"("type");
CREATE INDEX "Letter_createdAt_idx" ON "Letter"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
