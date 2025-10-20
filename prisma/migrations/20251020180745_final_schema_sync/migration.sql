/*
  Warnings:

  - A unique constraint covering the columns `[recoveryCodeHash]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "recoveryCodeHash" TEXT;

-- CreateTable
CREATE TABLE "public"."text_snippets" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'İsimsiz Metin',
    "projectId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "text_snippets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "text_snippets_publicId_key" ON "public"."text_snippets"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "users_recoveryCodeHash_key" ON "public"."users"("recoveryCodeHash");

-- AddForeignKey
ALTER TABLE "public"."text_snippets" ADD CONSTRAINT "text_snippets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
