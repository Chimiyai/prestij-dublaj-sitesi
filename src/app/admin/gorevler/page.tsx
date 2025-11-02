// src/app/admin/gorevler/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import GorevlerClientPage from './GorevlerClientPage';

export const dynamic = 'force-dynamic';

async function getTasksForUser(userId: number, userRole: string) {
  let whereClause: Prisma.ProductionTaskWhereInput = {};

  // Role göre filtreleme
  switch (userRole) {
    case 'VOICE_ACTOR':
      whereClause = { assignedVoiceActorId: userId, status: 'PENDING_VOICE_ACTOR' };
      break;
    case 'MIX_MASTER':
      whereClause = { status: 'PENDING_MIX_MASTER' }; // Mix/Master tüm bekleyenleri görsün
      break;
    case 'MODDER':
      whereClause = { status: 'PENDING_MODDER' }; // Modder tüm bekleyenleri görsün
      break;
    case 'ADMIN':
    case 'MODERATOR':
      whereClause = {}; // Admin/Mod her şeyi görür
      break;
    default:
      whereClause = { id: -1 }; // Diğer roller hiçbir şey görmez
      break;
  }
  
  return prisma.productionTask.findMany({
    where: whereClause,
    include: {
      project: { select: { title: true } },
      assignedVoiceActor: { select: { username: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export type TaskWithProject = Prisma.ProductionTaskGetPayload<{
  include: {
    project: { select: { title: true } };
    assignedVoiceActor: { select: { username: true } };
  }
}>;

export default async function GorevlerPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/giris');
  }

  const tasks = await getTasksForUser(parseInt(session.user.id), session.user.role);

  return (
    <div className="p-4 md:p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Görevlerim ({tasks.length})</h1>
      <GorevlerClientPage initialTasks={tasks} currentUserRole={session.user.role} />
    </div>
  );
}