-- CreateTable
CREATE TABLE "LetterAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "letterId" TEXT NOT NULL,
    "referralId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'LETTER',
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LetterAttachment_letterId_fkey" FOREIGN KEY ("letterId") REFERENCES "Letter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LetterAttachment_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "LetterReferral" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LetterAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "companyId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "letterId" TEXT,
    "letterReferralId" TEXT,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_letterId_fkey" FOREIGN KEY ("letterId") REFERENCES "Letter" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_letterReferralId_fkey" FOREIGN KEY ("letterReferralId") REFERENCES "LetterReferral" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AuditLog" ("action", "companyId", "createdAt", "description", "entity", "entityId", "id", "metadata", "userId") SELECT "action", "companyId", "createdAt", "description", "entity", "entityId", "id", "metadata", "userId" FROM "AuditLog";
DROP TABLE "AuditLog";
ALTER TABLE "new_AuditLog" RENAME TO "AuditLog";
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_companyId_idx" ON "AuditLog"("companyId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "LetterAttachment_storedName_key" ON "LetterAttachment"("storedName");

-- CreateIndex
CREATE INDEX "LetterAttachment_letterId_idx" ON "LetterAttachment"("letterId");

-- CreateIndex
CREATE INDEX "LetterAttachment_referralId_idx" ON "LetterAttachment"("referralId");

-- CreateIndex
CREATE INDEX "LetterAttachment_uploadedById_idx" ON "LetterAttachment"("uploadedById");

-- CreateIndex
CREATE INDEX "LetterAttachment_kind_idx" ON "LetterAttachment"("kind");
