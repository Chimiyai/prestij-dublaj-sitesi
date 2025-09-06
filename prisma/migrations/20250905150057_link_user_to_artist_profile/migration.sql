-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_dubbing_artists" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "slug" TEXT,
    "bio" TEXT,
    "imagePublicId" TEXT,
    "siteRole" TEXT,
    "websiteUrl" TEXT,
    "twitterUrl" TEXT,
    "instagramUrl" TEXT,
    "youtubeUrl" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "donationLink" TEXT,
    "isTeamMember" BOOLEAN NOT NULL DEFAULT false,
    "teamOrder" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER,
    CONSTRAINT "dubbing_artists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_dubbing_artists" ("bio", "createdAt", "donationLink", "favoriteCount", "firstName", "githubUrl", "id", "imagePublicId", "instagramUrl", "isTeamMember", "lastName", "likeCount", "linkedinUrl", "siteRole", "slug", "teamOrder", "twitterUrl", "updatedAt", "websiteUrl", "youtubeUrl") SELECT "bio", "createdAt", "donationLink", "favoriteCount", "firstName", "githubUrl", "id", "imagePublicId", "instagramUrl", "isTeamMember", "lastName", "likeCount", "linkedinUrl", "siteRole", "slug", "teamOrder", "twitterUrl", "updatedAt", "websiteUrl", "youtubeUrl" FROM "dubbing_artists";
DROP TABLE "dubbing_artists";
ALTER TABLE "new_dubbing_artists" RENAME TO "dubbing_artists";
CREATE UNIQUE INDEX "dubbing_artists_userId_key" ON "dubbing_artists"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
