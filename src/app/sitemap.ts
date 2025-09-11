// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

const BASE_URL = 'https://www.prestijstudio.com'; // DOMAIN ADINIZI BURAYA YAZIN

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Statik sayfaları ekle
  const staticRoutes = [
    '/',
    '/kadromuz',
    '/oneriler',
    '/indir',
    '/oyun-istek-sartlari',
    '/bize-katil'
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
  }));
  
  // Proje sayfalarını ekle
  const projects = await prisma.project.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });
  const projectRoutes = projects.map(project => ({
    url: `${BASE_URL}/projeler/${project.slug}`,
    lastModified: project.updatedAt.toISOString(),
  }));

  // Sanatçı sayfalarını ekle
  const artists = await prisma.dubbingArtist.findMany({
    select: { id: true, updatedAt: true },
  });
  const artistRoutes = artists.map(artist => ({
    url: `${BASE_URL}/sanatcilar/${artist.id}`,
    lastModified: artist.updatedAt.toISOString(),
  }));
  
  return [...staticRoutes, ...projectRoutes, ...artistRoutes];
}