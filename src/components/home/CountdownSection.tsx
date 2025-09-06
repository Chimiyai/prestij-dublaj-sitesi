// src/components/home/CountdownSection.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCloudinaryImageUrlOptimized } from '@/lib/cloudinary';
import Image from 'next/image';

// Tip tanımına coverImagePublicId eklendi
export interface FeaturedProject {
  title: string;
  slug: string;
  releaseDate: string;
  progressPercentage: number | null;
  bannerImagePublicId: string | null;
  coverImagePublicId: string | null; // <<< YENİ ALAN
}

// Zaman farkını hesaplayıp gün, saat, dakika, saniye'ye bölen hook
const useCountdown = (targetDate: string) => {
  const countDownDate = new Date(targetDate).getTime();

  const [countDown, setCountDown] = useState(
    countDownDate - new Date().getTime()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(countDownDate - new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [countDownDate]);

  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  // Geri sayım bittiyse negatif değerler yerine 0 göster
  if (countDown < 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return { days, hours, minutes, seconds };
};

// Zaman birimlerini göstermek için küçük bir bileşen
const DateTimeDisplay = ({ value, type }: { value: number, type: string }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm rounded-lg p-3 sm:p-4 w-20 h-20 sm:w-24 sm:h-24 border border-white/10">
      <span className="text-3xl sm:text-4xl font-bold text-white tracking-wider">{value.toString().padStart(2, '0')}</span>
      <span className="text-xs sm:text-sm text-gray-400 uppercase">{type}</span>
    </div>
  );
};


export default function CountdownSection() {
  const [project, setProject] = useState<FeaturedProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProject = async () => {
      try {
        // Bu API rotasını birazdan oluşturacağız
        const res = await fetch('/api/projects/featured');
        if (!res.ok) {
          // Öne çıkan proje yoksa (404), hata vermeyip boş bırakabiliriz.
          if (res.status === 404) {
            setProject(null);
            return;
          }
          throw new Error('Veri çekilemedi');
        }
        const data = await res.json();
        setProject(data);
      } catch (error) {
        console.error("Öne çıkan proje çekilirken hata:", error);
        setProject(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeaturedProject();
  }, []);

  const { days, hours, minutes, seconds } = useCountdown(project?.releaseDate || new Date().toISOString());

  // Cloudinary URL'lerini oluşturalım
  const bannerUrl = getCloudinaryImageUrlOptimized(project?.bannerImagePublicId, {
    width: 1920, height: 1080, crop: 'fill', gravity: 'auto', quality: 'auto:good'
  });
  const coverUrl = getCloudinaryImageUrlOptimized(project?.coverImagePublicId, {
    width: 300, height: 400, crop: 'fill', gravity: 'face'
  });

  if (isLoading || !project) {
    return null; // Proje yoksa veya yükleniyorsa bölümü gösterme
  }
  
  const isCountdownFinished = days + hours + minutes + seconds <= 0;

  return (
    <section className="relative text-white overflow-hidden">
      {/* Arka Plan Banner'ı */}
      <div className="absolute inset-0">
        <Image
          src={bannerUrl || '/images/default-banner.jpg'} // Varsayılan bir banner
          alt={`${project.title} arka planı`}
          fill
          className="object-cover"
          quality={75}
          priority // Anasayfanın önemli bir görseli olduğu için
        />
        <div className="absolute inset-0 bg-black/80"></div>
        {/* Üstüne koyu gradyan ve blur efekti */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08060D] via-[#08060D]/80 to-transparent backdrop-blur-sm" />
      </div>

      <div className="container mx-auto px-4 py-20 sm:py-28 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Sol Taraf: Bilgi, Geri Sayım ve İlerleme */}
          <div className="text-center lg:text-left">
            <p className="font-semibold text-prestij-purple tracking-widest uppercase mb-2">
              YAKINDA GELİYOR
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-shadow-sm">
              {project.title}
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0">
              {isCountdownFinished ? "Projemiz artık yayında! Hemen inceleyin." : "Yeni projemizin yayınlanmasına kalan süre:"}
            </p>

            {!isCountdownFinished && (
              <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-10">
                <DateTimeDisplay value={days} type="Gün" />
                <DateTimeDisplay value={hours} type="Saat" />
                <DateTimeDisplay value={minutes} type="Dakika" />
                <DateTimeDisplay value={seconds} type="Saniye" />
              </div>
            )}

            {project.progressPercentage !== null && (
              <div className="max-w-md mx-auto lg:mx-0 mb-10">
                <div className="flex justify-between items-center mb-2 text-sm text-gray-200">
                    <span>Proje İlerlemesi</span>
                    <span className="font-semibold text-lg">{project.progressPercentage}%</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-3 border border-white/10">
                    <div 
                        className="bg-gradient-to-r from-prestij-purple-light to-prestij-purple h-full rounded-full transition-all duration-500" 
                        style={{ width: `${project.progressPercentage}%` }}
                    ></div>
                </div>
              </div>
            )}
            
            <Link href={`/projeler/${project.slug}`} className="inline-block bg-prestij-purple hover:bg-prestij-purple-darker text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105">
              Projeyi İncele
            </Link>
          </div>

          {/* Sağ Taraf: Kapak Fotoğrafı */}
          <div className="flex justify-center items-center">
            <div className="relative w-[250px] h-[350px] sm:w-[300px] sm:h-[420px] group">
              <div className="absolute -inset-1 bg-gradient-to-r from-prestij-purple to-indigo-600 rounded-lg blur-lg opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <Image
                src={coverUrl || '/images/default-cover.jpg'}
                alt={`${project.title} kapak fotoğrafı`}
                fill
                className="relative rounded-lg object-cover shadow-2xl"
                sizes="(max-width: 640px) 250px, 300px"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
