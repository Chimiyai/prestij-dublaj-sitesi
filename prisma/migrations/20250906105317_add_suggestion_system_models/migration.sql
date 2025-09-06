/*
  Warnings:

  - Added the required column `updatedAt` to the `support_suggestions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "community_suggestions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameTitle" TEXT NOT NULL,
    "steamUrl" TEXT,
    "submittedById" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "community_suggestions_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "community_suggestion_votes" (
    "userId" INTEGER NOT NULL,
    "suggestionId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "suggestionId"),
    CONSTRAINT "community_suggestion_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "community_suggestion_votes_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES "community_suggestions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_support_suggestions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameTitle" TEXT NOT NULL,
    "steamUrl" TEXT,
    "notes" TEXT,
    "userId" INTEGER,
    "supporterName" TEXT NOT NULL,
    "supportAmount" REAL NOT NULL,
    "paymentProvider" TEXT NOT NULL,
    "transactionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "support_suggestions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_support_suggestions" ("createdAt", "gameTitle", "id", "paymentProvider", "status", "supportAmount", "supporterName", "transactionId", "userId") SELECT "createdAt", "gameTitle", "id", "paymentProvider", "status", "supportAmount", "supporterName", "transactionId", "userId" FROM "support_suggestions";
DROP TABLE "support_suggestions";
ALTER TABLE "new_support_suggestions" RENAME TO "support_suggestions";
CREATE UNIQUE INDEX "support_suggestions_transactionId_key" ON "support_suggestions"("transactionId");
CREATE INDEX "support_suggestions_userId_idx" ON "support_suggestions"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "community_suggestions_submittedById_idx" ON "community_suggestions"("submittedById");

-- CreateIndex
CREATE INDEX "community_suggestion_votes_suggestionId_idx" ON "community_suggestion_votes"("suggestionId");
