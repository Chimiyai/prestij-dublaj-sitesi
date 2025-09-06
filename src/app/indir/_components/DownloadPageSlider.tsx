// src/app/indir/_components/DownloadPageSlider.tsx
'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';

import Image from 'next/image';
import { getCloudinaryImageUrlOptimized } from '@/lib/cloudinary';

interface ProjectForSlider {
  title: string;
  slug: string;
  coverImagePublicId: string | null;
}

interface DownloadPageSliderProps {
  projects: ProjectForSlider[];
}

export function DownloadPageSlider({ projects }: DownloadPageSliderProps) {
  if (projects.length === 0) {
    return <div className="w-64 h-96 bg-gray-900 rounded-xl flex items-center justify-center text-gray-500">Görsel Yok</div>;
  }

  return (
    <div className="w-[280px] h-[420px] sm:w-[320px] sm:h-[480px]">
      <Swiper
        effect={'cards'}
        grabCursor={true}
        modules={[EffectCards, Autoplay]}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        loop={true}
        className="w-full h-full"
      >
        {projects.map((project) => (
          <SwiperSlide key={project.slug} className="rounded-xl overflow-hidden bg-gray-900 shadow-2xl">
            <Image
              src={getCloudinaryImageUrlOptimized(project.coverImagePublicId, {
                width: 400, height: 600, crop: 'fill', gravity: 'face'
              })}
              alt={project.title}
              fill
              className="object-cover"
              sizes="400px"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}