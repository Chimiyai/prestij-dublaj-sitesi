-- CreateTable
CREATE TABLE "character_dialogues" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "characterId" INTEGER NOT NULL,
    "dialogueText" TEXT NOT NULL,
    "originalVoiceUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "character_dialogues_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "project_characters" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "voice_submissions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dialogueId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "audioFilePublicId" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "voice_submissions_dialogueId_fkey" FOREIGN KEY ("dialogueId") REFERENCES "character_dialogues" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "voice_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_project_characters" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isVolunteerNeeded" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "project_characters_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_project_characters" ("createdAt", "id", "name", "projectId", "updatedAt") SELECT "createdAt", "id", "name", "projectId", "updatedAt" FROM "project_characters";
DROP TABLE "project_characters";
ALTER TABLE "new_project_characters" RENAME TO "project_characters";
CREATE INDEX "project_characters_projectId_idx" ON "project_characters"("projectId");
CREATE UNIQUE INDEX "project_characters_projectId_name_key" ON "project_characters"("projectId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "character_dialogues_characterId_idx" ON "character_dialogues"("characterId");

-- CreateIndex
CREATE INDEX "voice_submissions_dialogueId_idx" ON "voice_submissions"("dialogueId");

-- CreateIndex
CREATE INDEX "voice_submissions_userId_idx" ON "voice_submissions"("userId");
