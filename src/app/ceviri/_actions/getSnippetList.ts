// src/app/ceviri/_actions/getSnippetList.ts
'use server';
import prisma from '@/lib/prisma';

export async function getSnippetList() {
  const snippets = await prisma.textSnippet.findMany({
    select: {
      id: true,
      publicId: true,
      title: true,
      projectId: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  return snippets;
}