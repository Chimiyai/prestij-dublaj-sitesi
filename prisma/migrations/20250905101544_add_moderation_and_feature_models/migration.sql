-- CreateTable
CREATE TABLE "team_applications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "selectedRole" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "team_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "support_suggestions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameTitle" TEXT NOT NULL,
    "userId" INTEGER,
    "supporterName" TEXT NOT NULL,
    "supportAmount" REAL NOT NULL,
    "paymentProvider" TEXT NOT NULL,
    "transactionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "support_suggestions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "download_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "downloadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    CONSTRAINT "download_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "download_logs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_projects" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "coverImagePublicId" TEXT,
    "bannerImagePublicId" TEXT,
    "externalWatchUrl" TEXT,
    "releaseDate" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "dislikeCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "averageRating" REAL NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "trailerUrl" TEXT,
    "price" REAL,
    "currency" TEXT DEFAULT 'TRY',
    "isFeaturedForCountdown" BOOLEAN NOT NULL DEFAULT false,
    "progressPercentage" INTEGER
);
INSERT INTO "new_projects" ("averageRating", "bannerImagePublicId", "coverImagePublicId", "createdAt", "currency", "description", "dislikeCount", "externalWatchUrl", "favoriteCount", "id", "isPublished", "likeCount", "price", "ratingCount", "releaseDate", "slug", "title", "trailerUrl", "type", "updatedAt", "viewCount") SELECT "averageRating", "bannerImagePublicId", "coverImagePublicId", "createdAt", "currency", "description", "dislikeCount", "externalWatchUrl", "favoriteCount", "id", "isPublished", "likeCount", "price", "ratingCount", "releaseDate", "slug", "title", "trailerUrl", "type", "updatedAt", "viewCount" FROM "projects";
DROP TABLE "projects";
ALTER TABLE "new_projects" RENAME TO "projects";
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "profileImagePublicId" TEXT,
    "bannerImagePublicId" TEXT,
    "bio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "banExpiresAt" DATETIME,
    "banReason" TEXT
);
INSERT INTO "new_users" ("banExpiresAt", "banReason", "bannerImagePublicId", "bio", "createdAt", "email", "id", "isBanned", "password", "profileImagePublicId", "role", "updatedAt", "username") SELECT "banExpiresAt", "banReason", "bannerImagePublicId", "bio", "createdAt", "email", "id", "isBanned", "password", "profileImagePublicId", "role", "updatedAt", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "team_applications_userId_idx" ON "team_applications"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "support_suggestions_transactionId_key" ON "support_suggestions"("transactionId");

-- CreateIndex
CREATE INDEX "support_suggestions_userId_idx" ON "support_suggestions"("userId");

-- CreateIndex
CREATE INDEX "download_logs_userId_idx" ON "download_logs"("userId");

-- CreateIndex
CREATE INDEX "download_logs_projectId_idx" ON "download_logs"("projectId");
