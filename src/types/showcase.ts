export interface CategoryInfo {
  id: string | number;
  name: string;
  slug: string;
}

// Bu tip, ShowcaseSection ve SliderCard tarafından kullanılacak
export interface ShowcaseCardData { // İsmi daha genel yapalım, CardDataItem çakışmasını önlemek için
  slug: string;
  title: string;
  categories: CategoryInfo[]; // Kategorileri göstereceğiz
  coverImageUrl: string;       // Cloudinary public ID veya placeholder yolu
  bannerImageUrl: string;      // Cloudinary public ID veya placeholder yolu
  description?: string;
  // 'type' alanı (oyun/anime) artık bu genel kart datasında doğrudan olmayabilir,
  // çünkü kartın kendisi kategorileri gösterecek.
  // Genel 'type' (oyun/anime) bilgisi, ShowcaseSection'a section bazında gelebilir.
}
// Popüler içerik kartları ve API'den gelen genel proje verisi için
export interface ApiProjectPopular {
  id: number;
  slug: string;
  title: string;
  type: 'oyun' | 'anime';
  bannerImagePublicId: string | null;
  coverImagePublicId: string | null;
  description: string | null;
  releaseDate: string | Date | null;
  createdAt: string | Date | null;
  
  // --- GERÇEK ALAN ADLARINI KULLAN ---
  likeCount: number;
  dislikeCount: number;
  favoriteCount: number;
  // ---------------------------------
}

// API'den gelen ham proje verisi için tip (bu daha detaylı olabilir)
export interface ApiProject {
    id: number;
    title: string;
    slug: string;
    type: string; // "oyun" veya "anime" (API'den gelen ham tür)
    description?: string | null;
    coverImagePublicId?: string | null;
    bannerImagePublicId?: string | null;
    categories: { category: CategoryInfo }[];
    viewCount: number;
    likeCount: number;
    favoriteCount: number;
    averageRating: number;
}