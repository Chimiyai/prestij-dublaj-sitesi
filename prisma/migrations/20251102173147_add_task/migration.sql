-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('PENDING_VOICE_ACTOR', 'PENDING_MIX_MASTER', 'PENDING_MODDER', 'COMPLETED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."UserRole" ADD VALUE 'VOICE_ACTOR';
ALTER TYPE "public"."UserRole" ADD VALUE 'TRANSLATOR';
ALTER TYPE "public"."UserRole" ADD VALUE 'MODDER';
ALTER TYPE "public"."UserRole" ADD VALUE 'MIX_MASTER';

-- CreateTable
CREATE TABLE "public"."production_tasks" (
    "id" SERIAL NOT NULL,
    "characterName" TEXT NOT NULL,
    "scriptFileUrl" TEXT NOT NULL,
    "voiceRecordUrl" TEXT,
    "mixedAudioUrl" TEXT,
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'PENDING_VOICE_ACTOR',
    "projectId" INTEGER NOT NULL,
    "assignedTranslatorId" INTEGER,
    "assignedVoiceActorId" INTEGER,
    "assignedMixMasterId" INTEGER,
    "assignedModderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_tasks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."production_tasks" ADD CONSTRAINT "production_tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."production_tasks" ADD CONSTRAINT "production_tasks_assignedTranslatorId_fkey" FOREIGN KEY ("assignedTranslatorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."production_tasks" ADD CONSTRAINT "production_tasks_assignedVoiceActorId_fkey" FOREIGN KEY ("assignedVoiceActorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."production_tasks" ADD CONSTRAINT "production_tasks_assignedMixMasterId_fkey" FOREIGN KEY ("assignedMixMasterId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."production_tasks" ADD CONSTRAINT "production_tasks_assignedModderId_fkey" FOREIGN KEY ("assignedModderId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
