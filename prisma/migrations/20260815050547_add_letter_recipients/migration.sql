-- CreateTable
CREATE TABLE "LetterRecipient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "letterId" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL,
    "userId" TEXT,
    "departmentId" TEXT,
    "companyId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "readAt" DATETIME,
    "receivedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LetterRecipient_letterId_fkey" FOREIGN KEY ("letterId") REFERENCES "Letter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LetterRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LetterRecipient_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LetterRecipient_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "LetterRecipient_letterId_idx" ON "LetterRecipient"("letterId");

-- CreateIndex
CREATE INDEX "LetterRecipient_userId_idx" ON "LetterRecipient"("userId");

-- CreateIndex
CREATE INDEX "LetterRecipient_departmentId_idx" ON "LetterRecipient"("departmentId");

-- CreateIndex
CREATE INDEX "LetterRecipient_companyId_idx" ON "LetterRecipient"("companyId");

-- CreateIndex
CREATE INDEX "LetterRecipient_status_idx" ON "LetterRecipient"("status");
