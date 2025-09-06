/*
  Warnings:

  - Made the column `steamUrl` on table `community_suggestions` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_community_suggestions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameTitle" TEXT NOT NULL,
    "steamUrl" TEXT NOT NULL,
    "submittedById" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "community_suggestions_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_community_suggestions" ("createdAt", "gameTitle", "id", "status", "steamUrl", "submittedById") SELECT "createdAt", "gameTitle", "id", "status", "steamUrl", "submittedById" FROM "community_suggestions";
DROP TABLE "community_suggestions";
ALTER TABLE "new_community_suggestions" RENAME TO "community_suggestions";
CREATE UNIQUE INDEX "community_suggestions_steamUrl_key" ON "community_suggestions"("steamUrl");
CREATE INDEX "community_suggestions_submittedById_idx" ON "community_suggestions"("submittedById");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
