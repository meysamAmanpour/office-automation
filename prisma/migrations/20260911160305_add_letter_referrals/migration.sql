-- CreateTable
CREATE TABLE "LetterReferral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "letterId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetUserId" TEXT,
    "targetDepartmentId" TEXT,
    "parentId" TEXT,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueDate" DATETIME,
    "receivedAt" DATETIME,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LetterReferral_letterId_fkey" FOREIGN KEY ("letterId") REFERENCES "Letter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LetterReferral_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LetterReferral_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LetterReferral_targetDepartmentId_fkey" FOREIGN KEY ("targetDepartmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LetterReferral_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "LetterReferral" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "LetterReferral_letterId_idx" ON "LetterReferral"("letterId");

-- CreateIndex
CREATE INDEX "LetterReferral_senderId_idx" ON "LetterReferral"("senderId");

-- CreateIndex
CREATE INDEX "LetterReferral_targetUserId_idx" ON "LetterReferral"("targetUserId");

-- CreateIndex
CREATE INDEX "LetterReferral_targetDepartmentId_idx" ON "LetterReferral"("targetDepartmentId");

-- CreateIndex
CREATE INDEX "LetterReferral_status_idx" ON "LetterReferral"("status");

-- CreateIndex
CREATE INDEX "LetterReferral_parentId_idx" ON "LetterReferral"("parentId");

-- CreateIndex
CREATE INDEX "LetterReferral_dueDate_idx" ON "LetterReferral"("dueDate");
