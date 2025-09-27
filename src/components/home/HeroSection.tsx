// src/components/home/HeroSection.tsx
"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import TopProjectCard from './TopProjectCard';
import MainShowcase from './MainShowcase';
import SideShowcaseItem from './SideShowcaseItem';
// Placeholder'ları import etmeye devam ediyoruz
import TopProjectCardPlaceholder from './TopProjectCardPlaceholder';
import MainShowcasePlaceholder from './MainShowcasePlaceholder';
import SideShowcaseItemPlaceholder from './SideShowcaseItemPlaceholder';

const AUTO_SLIDE_DELAY = 5000;

interface ApiBaseProject {
  id: string | number;
  slug: string;
  title: string;
  type: string;
  bannerImagePublicId?: string | null;
  coverImagePublicId?: string | null;
  releaseDate?: string | Date | null;
  description?: string | null;
}

// --- DEĞİŞİKLİK 1: Fonksiyonu doğru API'yi çağıracak şekilde güncelledik ---
async function fetchTopProjectsForRow(): Promise<ApiBaseProject[]> {
  try {
    // En son eklenen 3 projeyi çekiyoruz
    const res = await fetch('/api/projects?sortBy=newest&limit=3');
    if (!res.ok) { 
      console.error("Üst sıra projeleri yüklenemedi"); 
      return []; 
    }
    const data = await res.json();
    return data.projects || [];
  } catch (e) { 
    console.error("API Error fetchTopProjectsForRow:", e); 
    return []; 
  }
}

// --- DEĞİŞİKLİK 2: Bu fonksiyonu da doğru parametreleri kullanacak şekilde güncelledik ---
async function fetchLatestProjectsForSideList(): Promise<ApiBaseProject[]> {
  try {
    // En son eklenen 4 projeyi çekiyoruz
    const res = await fetch('/api/projects?sortBy=newest&limit=4');
    if (!res.ok) { 
      console.error("Yan liste projeleri yüklenemedi"); 
      return []; 
    }
    const data = await res.json();
    return data.projects || [];
  } catch (e) { 
    console.error("API Error fetchLatestProjectsForSideList:", e); 
    return []; 
  }
}

const HeroSection = () => {
  const [topProjects, setTopProjects] = useState<ApiBaseProject[]>([]);
  const [sideListApiData, setSideListApiData] = useState<ApiBaseProject[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const autoSlideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true); // Yüklemeyi başta başlat
      // --- DEĞİŞİKLİK 3: Güncellenmiş fonksiyonu çağırıyoruz ---
      const [topData, sideData] = await Promise.all([
        fetchTopProjectsForRow(),
        fetchLatestProjectsForSideList()
      ]);
      setTopProjects(topData);
      setSideListApiData(sideData);
      setIsLoading(false); // Veriler gelince yüklemeyi bitir
    };
    loadData();
  }, []);

  const sideListData = sideListApiData.map((p, index) => ({
    index: index,
    id: p.id.toString(),
    title: p.title,
    description: p.description || "Bu proje için açıklama yakında eklenecektir.",
    image: p.bannerImagePublicId,
    banner: p.bannerImagePublicId,
    cover: p.coverImagePublicId,
    type: p.type.toLowerCase() === 'oyun' ? 'Oyun' : 'Anime',
    detailsUrl: `/projeler/${p.slug}`, // Linki /projeler/ olarak düzelttik
    cardTitle: p.title,
    slug: p.slug,
    releaseDate: p.releaseDate,
  }));

  const currentCardData = sideListData.length > 0 ? sideListData[currentIndex] : null;

  const changeShowcaseItem = useCallback((newIndex: number) => {
    if (newIndex < 0 || newIndex >= sideListData.length || newIndex === currentIndex) return;
    setCurrentIndex(newIndex);
  }, [currentIndex, sideListData.length]);

  useEffect(() => {
    if (sideListData.length <= 1) return;

    if (autoSlideTimerRef.current) clearTimeout(autoSlideTimerRef.current);
    autoSlideTimerRef.current = setTimeout(() => {
      const nextIndex = (currentIndex + 1) % sideListData.length;
      setCurrentIndex(nextIndex); // Doğrudan state'i güncelle
    }, AUTO_SLIDE_DELAY);

    return () => {
      if (autoSlideTimerRef.current) clearTimeout(autoSlideTimerRef.current);
    };
  }, [currentIndex, sideListData.length]);

  const handleSideItemClick = (index: number) => {
    changeShowcaseItem(index);
  };


  if (isLoading) {
    return (
      <section className="hero-section bg-prestij-bg-dark-3 py-8 mb-12 overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Üstteki 3 Favori Kart Placeholder */}
          <div className="top-projects-row flex flex-col md:flex-row justify-center md:justify-between gap-5 mb-8">
            {[...Array(3)].map((_, i) => (
              <TopProjectCardPlaceholder key={`top-ph-${i}`} />
            ))}
          </div>

          {/* Ana Hero İçeriği Placeholder */}
          <div className="main-hero-content flex flex-col lg:flex-row gap-5 items-stretch relative w-full">
            <div className="relative flex-grow lg:min-w-0 lg:w-[calc(100%-300px)] xl:w-[calc(100%-320px)] min-h-[450px] lg:min-h-[500px]">
              <MainShowcasePlaceholder />
            </div>
            <aside className="hero-side-list w-full lg:w-[280px] xl:w-[300px] lg:flex-shrink-0 flex flex-col gap-2.5 lg:h-auto lg:flex-grow">
              {[...Array(4)].map((_, i) => ( // Genellikle 4-5 tane yan liste öğesi olur
                <SideShowcaseItemPlaceholder key={`side-ph-${i}`} />
              ))}
            </aside>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero-section bg-prestij-bg-dark-3 py-8 overflow-hidden">
      <div className="container mx-auto px-4">
      {/* Bu bölüm artık doğru veriyle dolacağı için görünecektir */}
      {topProjects.length > 0 && (
          <div className="top-projects-row flex flex-col md:flex-row justify-center md:justify-between gap-5 mb-8">
            {topProjects.map((project) => (
              <TopProjectCard
                  key={project.id.toString()}
                  type={project.type.toLowerCase() === 'oyun' ? 'Oyun' : 'Anime'}
                  title={project.title}
                  description={project.description}
                  date={project.releaseDate}
                  bannerUrl={project.bannerImagePublicId}
                  coverUrl={project.coverImagePublicId}
                  slug={project.slug}
              />
            ))}
          </div>
      )}
      {!isLoading && topProjects.length === 0 && sideListData.length === 0 && (
        <div className="min-h-[100px] flex justify-center items-center mb-8">
            <p className="text-prestij-text-dark">Şu anda öne çıkan proje bulunmuyor.</p>
        </div>
      )}

        {currentCardData ? (
            (() => {
                // console.log(`%cHeroSection RENDERING MainShowcase with showcaseKey: ${currentCardData.id.toString()}`, "color: purple; font-weight: bold;");
                return (
                    <div className="hero-section-container flex flex-col lg:flex-row gap-3">
                      <div className="hero-main flex-grow">
                        <MainShowcase
                            showcaseKey={currentCardData.id.toString()}
                            category={currentCardData.type}
                            title={currentCardData.title}
                            description={currentCardData.description || ""}
                            imageUrl={currentCardData.image}
                            coverUrl={currentCardData.cover}
                            detailsUrl={currentCardData.detailsUrl || '#'}
                            releaseDate={currentCardData.releaseDate} // << Tarihi MainShowcase'e prop olarak geçiyoruz
                        />
                      </div>
                      
                      <div className="hero-side-list flex flex-col gap-2 lg:w-[300px]">
                        {sideListData.map((item, index) => (
                            <SideShowcaseItem
                                key={item.id}
                                cardTitle={item.cardTitle || item.title}
                                type={item.type}
                                coverUrl={item.cover}
                                bannerUrl={item.banner}
                                isActive={index === currentIndex}
                                onClick={() => handleSideItemClick(index)}
                                // SideShowcaseItem'a tarih eklemek isterseniz item.releaseDate'i de prop olarak geçebilirsiniz.
                            />
                        ))}
                      </div>
                    </div>
                );
            })()
        ) : (
            !isLoading && <div className="min-h-[400px] flex justify-center items-center"><p className="text-prestij-text-dark">Gösterilecek ana içerik bulunamadı.</p></div>
        )}
      </div>
    </section>
  );
};
export default HeroSection;