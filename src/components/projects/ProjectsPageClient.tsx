// src/components/projects/ProjectsPageClient.tsx
'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Category, Project as PrismaProjectType } from '@prisma/client';
import toast from 'react-hot-toast';

import FilterSidebar from './FilterSidebar';
import ProjectGrid from './ProjectGrid';
import SortDropdown, { SortOptionItem } from './SortDropdown';
import Pagination from '@/components/ui/Pagination';
import { Prisma } from '@prisma/client';

// --- HATA DÜZELTME 1: Sıralama değerlerini API'nin anladığı şekilde güncelledik ---
const sortOptionsList: SortOptionItem[] = [
    { value: 'newest', label: 'Eklenme Tarihi (Yeni)', group: 'Tarihe Göre' },
    { value: 'oldest', label: 'Eklenme Tarihi (Eski)', group: 'Tarihe Göre' },
    { value: 'titleAsc', label: 'Alfabetik (A-Z)', group: 'Alfabetik' },
    { value: 'titleDesc', label: 'Alfabetik (Z-A)', group: 'Alfabetik' },
    { value: 'popular', label: 'En Popüler', group: 'Popülerlik' },
    { value: 'likes', label: 'En Çok Beğenilen', group: 'Popülerlik' },
    // Not: API'nizde 'averageRating' ve 'viewCount' için sıralama mantığı yok.
    // İsterseniz ekleyebilirsiniz, şimdilik bu kadar yeterli.
];

const projectCardSelect = Prisma.validator<Prisma.ProjectSelect>()({
  id: true,
  slug: true,
  title: true,
  type: true,
  coverImagePublicId: true,
  bannerImagePublicId: true,
  description: true,
  releaseDate: true,
  likeCount: true,
  dislikeCount: true,
  favoriteCount: true,
  averageRating: true,
  price: true,
  currency: true,
});

export type ProjectForCard = Prisma.ProjectGetPayload<{
  select: typeof projectCardSelect
}>;

interface ApiResponse {
  projects: ProjectForCard[];
  totalPages: number;
  currentPage: number;
  totalResults: number;
}

interface ProjectsPageClientProps {
  initialCategories: Category[];
}

const ITEMS_PER_PAGE = 20;

export default function ProjectsPageClient({ initialCategories }: ProjectsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFetching, startFetchingTransition] = useTransition();

  const getInitialParam = <T,>(paramName: string, defaultValue: T, parser: (val: string) => T = (val) => val as T): T => {
    const value = searchParams.get(paramName);
    return value ? parser(value) : defaultValue;
  };

  const [projects, setProjects] = useState<ProjectForCard[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  
  const [currentPage, setCurrentPage] = useState(() => getInitialParam('page', 1, Number));
  const [currentSort, setCurrentSort] = useState(() => getInitialParam('sortBy', 'newest')); // 'sort' yerine 'sortBy' ve varsayılan 'newest'
  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState<string[]>(() => getInitialParam('categories', [], val => val.split(',')));
  const [searchTerm, setSearchTerm] = useState(() => getInitialParam('title_contains', ''));
  const [projectType, setProjectType] = useState<'oyun' | 'anime' | ''>(() => getInitialParam('type', '' as 'oyun' | 'anime' | ''));

  const fetchProjects = useCallback(() => {
    startFetchingTransition(async () => {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', ITEMS_PER_PAGE.toString());
      
      // --- HATA DÜZELTME 2: Sıralama parametresini API'nin beklediği gibi tek parça gönderiyoruz ---
      if (currentSort) {
        params.set('sortBy', currentSort);
      }

      // --- HATA DÜZELTME 3: Kategori parametresinin adını 'categories' (çoğul) olarak düzelttik ---
      if (selectedCategorySlugs.length > 0) {
        params.set('categories', selectedCategorySlugs.join(','));
      }
      
      if (searchTerm.trim()) {
        params.set('title_contains', searchTerm.trim());
      }
      
      if (projectType) {
        params.set('type', projectType);
      }

      try {
        const apiUrl = `/api/projects?${params.toString()}`;
        console.log("ProjectsPageClient: Giden API İsteği:", apiUrl); // Kontrol için log
        const res = await fetch(apiUrl);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({ message: 'Projeler yüklenirken bir hata oluştu.' }));
          throw new Error(errData.message || 'Projeler yüklenemedi.');
        }
        const data: ApiResponse = await res.json();
        setProjects(data.projects || []);
        setTotalPages(data.totalPages || 1);
        setTotalResults(data.totalResults || 0);
      } catch (error) {
        console.error("Projeler çekilirken hata:", error);
        toast.error((error as Error).message || "Projeler yüklenirken bir hata oluştu.");
        setProjects([]);
        setTotalPages(1);
        setTotalResults(0);
      }
    });
  }, [currentPage, currentSort, selectedCategorySlugs, searchTerm, projectType]); // startFetchingTransition'ı bağımlılıktan çıkardık

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', currentPage.toString());
    params.set('sortBy', currentSort); // URL'i de 'sortBy' olarak güncelleyelim

    if (selectedCategorySlugs.length > 0) params.set('categories', selectedCategorySlugs.join(','));
    else params.delete('categories');
    
    if (searchTerm.trim()) params.set('title_contains', searchTerm.trim());
    else params.delete('title_contains');

    if (projectType) params.set('type', projectType);
    else params.delete('type');
    
    // URL'i sadece gerçekten değiştiyse güncelle, gereksiz render'ları önle
    if (params.toString() !== new URLSearchParams(searchParams.toString()).toString()) {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
    
    fetchProjects();
  }, [currentPage, currentSort, selectedCategorySlugs, searchTerm, projectType, pathname, router, fetchProjects, searchParams]);


  // Event Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChangeCallback = (newSortValue: string) => {
    setCurrentSort(newSortValue);
    setCurrentPage(1);
  };
  
  const handleCategoryChange = (categorySlugs: string[]) => {
    setSelectedCategorySlugs(categorySlugs);
    setCurrentPage(1);
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  const handleProjectTypeChange = (type: 'oyun' | 'anime' | '') => {
    setProjectType(type);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-x-8 gap-y-6">
      <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 lg:sticky lg:top-24 self-start">
        <FilterSidebar
          categories={initialCategories}
          selectedCategorySlugs={selectedCategorySlugs}
          onCategoryChange={handleCategoryChange}
          currentSearchTerm={searchTerm}
          onSearchTermChange={handleSearchChange}
          currentProjectType={projectType}
          onProjectTypeChange={handleProjectTypeChange}
        />
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <p className="text-sm text-prestij-text-muted">
            {isFetching ? 'Projeler yükleniyor...' : (totalResults > 0 ? `${totalResults} proje bulundu.` : 'Aramanızla eşleşen proje bulunamadı.')}
          </p>
          <SortDropdown
            value={currentSort}
            onChange={handleSortChangeCallback}
            options={sortOptionsList}
          />
        </div>

        <ProjectGrid projects={projects} isLoading={isFetching} />

        {!isFetching && totalPages > 1 && (
          <div className="mt-10">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
