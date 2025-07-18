// src/components/admin/EditProjectForm.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useTransition, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { RoleInProject, Prisma } from '@prisma/client'; // Prisma'yı import et

// Alt component'ler
import ProjectDetailsFields from './ProjectDetailsFields';
import ProjectImagesManager from './ProjectImagesManager';
import ProjectPricingFields from './ProjectPricingFields';
import ProjectCategoriesSelect from './ProjectCategoriesSelect';
import ProjectCharactersManager, { ProjectCharacterData } from './ProjectCharactersManager';
import ProjectAssignmentsManager, { 
  AssignmentFormData as AssignmentManagerAssignmentData, // Alias kullan
  // CharacterOption as AssignmentManagerCharacterOption // Gerekirse diğerlerini de alias ile al
} from './ProjectAssignmentsManager';
import ProjectPublishSettings from './ProjectPublishSettings';

// Tipler
export type ProjectTypeEnum = 'oyun' | 'anime';

export interface AssignmentFormData {
  tempId: string;
  artistId: number;
  role: RoleInProject;
  artistName?: string;
  characterIds?: number[];
}
export interface InitialProjectData {
  id?: number;
  title: string;
  slug: string;
  type: ProjectTypeEnum;
  description: string | null;
  coverImagePublicId: string | null;
  bannerImagePublicId: string | null;
  releaseDate: string; // YYYY-MM-DD
  isPublished: boolean;
  price: number | null;
  currency: string | null;
  assignments: AssignmentManagerAssignmentData[];
  categoryIds: number[];
  externalWatchUrl?: string | null;
  trailerUrl?: string | null; // YENİ ALAN
}

interface EditProjectFormProps {
  project?: InitialProjectData;
  allArtists: { value: number; label: string }[];
  allCategories: { value: number; label: string }[];
  availableRoles: RoleInProject[];
  isEditing: boolean;
}

interface ApiPayload {
  title: string;
  slug: string;
  type: ProjectTypeEnum;
  description: string | null;
  coverImagePublicId: string | null;
  bannerImagePublicId: string | null;
  releaseDate: string | null;
  isPublished: boolean;
  externalWatchUrl?: string | null;
  price: number | null;
  currency: string | null;
  assignments: {
    artistId: number;
    role: RoleInProject;
    characterIds?: number[];
  }[];
  categoryIds: number[];
  trailerUrl?: string | null; // YENİ ALAN
}

interface FormErrors {
  title?: string[]; slug?: string[]; type?: string[]; description?: string[];
  coverImagePublicId?: string[]; bannerImagePublicId?: string[];
  releaseDate?: string[]; isPublished?: string[]; price?: string[]; currency?: string[];
  assignments?: string[]; categoryIds?: string[]; general?: string;
  trailerUrl?: string[]; // YENİ ALAN
  externalWatchUrl?: string[]; // Bu da eksikti sanırım, ekleyelim
}

// Cloudinary için yardımcı fonksiyon (dosyanın dışında veya lib/utils.ts'te olabilir)
const getArchivePublicId = (oldPublicId: string | null | undefined, typePrefix: string): string | null => {
    if (!oldPublicId) return null;
    const baseArchiveFolder = 'kullanilmayanlar'; // Cloudinary'de bir klasör
    // Cloudinary public ID'leri genellikle klasör yolu içerebilir.
    // Örn: 'project_covers/my_awesome_game_cover_123'
    // Sadece dosya adını alıp, başına prefix ve timestamp ekleyip, orijinal klasör yolunu koruyalım.
    let filenamePart = oldPublicId;
    let originalFolderPath = '';

    if (oldPublicId.includes('/')) {
        const parts = oldPublicId.split('/');
        filenamePart = parts.pop() || oldPublicId; // Son kısım dosya adı
        if (parts.length > 0) {
            originalFolderPath = parts.join('/') + '/'; // Orijinal klasör yolu
        }
    }
    // Arşivlenmiş ID: kullanilmayanlar/orijinal_klasor_yolu/tipPrefix_orijinalDosyaAdi_timestamp
    const newPublicId = `${baseArchiveFolder}/${originalFolderPath}${typePrefix}_${filenamePart}_${Date.now()}`;
    return newPublicId.substring(0, 200); // Cloudinary public ID uzunluk sınırı
};


export default function EditProjectForm({
  project: initialProjectData,
  allArtists,
  allCategories: initialAllCategoriesData = [],
  availableRoles,
  isEditing,
}: EditProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FormErrors>({});

  // --- FORM STATE'LERİ ---
  const [externalWatchUrl, setExternalWatchUrl] = useState(initialProjectData?.externalWatchUrl || '');
  const [title, setTitle] = useState(initialProjectData?.title || '');
  const [slug, setSlug] = useState(initialProjectData?.slug || '');
  const [projectType, setProjectType] = useState<ProjectTypeEnum>(initialProjectData?.type || 'oyun');
  const [description, setDescription] = useState(initialProjectData?.description || '');
  const [releaseDate, setReleaseDate] = useState(initialProjectData?.releaseDate || '');
  const [trailerUrl, setTrailerUrl] = useState<string | null>(initialProjectData?.trailerUrl || null); // YENİ STATE
  
  const [currentCoverPublicId, setCurrentCoverPublicId] = useState<string | null>(initialProjectData?.coverImagePublicId || null);
  const [currentBannerPublicId, setCurrentBannerPublicId] = useState<string | null>(initialProjectData?.bannerImagePublicId || null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(null);
  
  const [price, setPrice] = useState<string>(initialProjectData?.price?.toString() || '');
  const [currency, setCurrency] = useState<string>(initialProjectData?.currency || 'TRY');
  
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(initialProjectData?.categoryIds || []);
  
  const [currentAssignments, setCurrentAssignments] = useState<AssignmentFormData[]>(
    initialProjectData?.assignments.map((a, index) => ({ // tempId ekle
        ...a,
        tempId: a.tempId || `${Date.now()}-assign-${index}`
    })) || []
  );
  
  // Bu state, ProjectCharactersManager ve ProjectAssignmentsManager tarafından kullanılacak.
  // ProjectCharactersManager kendi içinde fetch edip, onCharactersUpdate ile burayı güncelleyecek.
  const [projectCharacters, setProjectCharacters] = useState<ProjectCharacterData[]>([]);
  const [isLoadingProjectCharacters, setIsLoadingProjectCharacters] = useState(false); // Bu ProjectCharactersManager'a prop olarak geçilebilir.
  
  const [isPublished, setIsPublished] = useState(initialProjectData?.isPublished ?? true);


  // Initial data değiştiğinde state'leri güncelle (form resetleme veya prop güncellemesi için)
  useEffect(() => {
    if (initialProjectData) {
      setTitle(initialProjectData.title || '');
      setSlug(initialProjectData.slug || '');
      setProjectType(initialProjectData.type || 'oyun');
      setDescription(initialProjectData.description || '');
      setReleaseDate(initialProjectData.releaseDate || '');
      setCurrentCoverPublicId(initialProjectData.coverImagePublicId || null);
      setCurrentBannerPublicId(initialProjectData.bannerImagePublicId || null);
      setPrice(initialProjectData.price?.toString() || '');
      setCurrency(initialProjectData.currency || 'TRY');
      setSelectedCategoryIds(initialProjectData.categoryIds || []);
      setCurrentAssignments(
        initialProjectData.assignments.map((a, index) => ({
          ...a,
          tempId: a.tempId || `${Date.now()}-assign-eff-${index}`
        })) || []
      );
      setIsPublished(initialProjectData.isPublished ?? true);
      setExternalWatchUrl(initialProjectData.externalWatchUrl || '');
      setTrailerUrl(initialProjectData?.trailerUrl || null);
      setSelectedCoverFile(null);
      setSelectedBannerFile(null);
    }
  }, [initialProjectData]);


  // Resim yükleme işlemini yönetecek yardımcı fonksiyon (önceki gibi)
  const handleImageUpload = async (
    file: File, 
    uploadContext: 'projectCover' | 'projectBanner', // Hangi tür resim olduğu
    identifierSeed: string, // Slug veya title gibi bir şey
    existingProjectId?: number // Düzenleme modunda proje ID'si
  ): Promise<string | null> => {
    const formData = new FormData();
    formData.append('imageFile', file);
    formData.append('uploadContext', uploadContext); // Backend'e hangi tür resim olduğunu bildirmek için
    
    let identifier = identifierSeed.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]+/g, '');
    if (!identifier && isEditing && existingProjectId) {
        identifier = existingProjectId.toString();
    } else if (!identifier) {
        identifier = `new-${uploadContext}-${Date.now()}`;
    }
    formData.append('identifier', identifier);
    formData.append('folder', uploadContext === 'projectCover' ? 'project_covers' : 'project_banners');

    const toastId = toast.loading(`${uploadContext === 'projectCover' ? 'Kapak' : 'Banner'} resmi yükleniyor...`);
    try {
      // API endpoint'i /api/admin/projects/cover-image/route.ts veya genel bir /api/image-upload olabilir.
      // cover-image endpoint'i genel bir resim yükleyiciyse onu kullanalım.
      const uploadResponse = await fetch('/api/admin/projects/cover-image', {
          method: 'POST', 
          body: formData 
      });
      const uploadData = await uploadResponse.json();
      toast.dismiss(toastId);

      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || `${uploadContext === 'projectCover' ? 'Kapak' : 'Banner'} resmi yüklenemedi.`);
      }
      toast.success(`${uploadContext === 'projectCover' ? 'Kapak' : 'Banner'} resmi başarıyla yüklendi.`);
      return uploadData.publicId; // API'nizin publicId döndürdüğünü varsayıyorum
    } catch (uploadError: any) {
      toast.dismiss(toastId);
      toast.error(uploadError.message);
      setErrors(prev => ({ ...prev, [uploadContext === 'projectCover' ? 'coverImagePublicId' : 'bannerImagePublicId']: [uploadError.message] }));
      return null;
    }
  };



  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setErrors({});
    // Basit validation (daha kapsamlısı Zod ile backend'de)
    if (!title.trim() || !slug.trim() || !releaseDate) {
      toast.error("Başlık, slug ve yayın tarihi alanları zorunludur.");
      setErrors(prev => ({
        ...prev,
        title: !title.trim() ? ["Başlık zorunludur."] : undefined,
        slug: !slug.trim() ? ["Slug zorunludur."] : undefined,
        releaseDate: !releaseDate ? ["Yayın tarihi zorunludur."] : undefined,
      }));
      return;
    }
    if (projectType === 'oyun' && price.trim() !== '' && parseFloat(price) < 0) {
        toast.error("Oyun fiyatı 0 veya pozitif bir değer olmalıdır.");
        setErrors(prev => ({ ...prev, price: ["Fiyat 0 veya pozitif olmalı."] }));
        return;
    }
    if (projectType === 'oyun' && price.trim() !== '' && currency.trim().length !== 3) {
        toast.error("Para birimi 3 karakter olmalıdır (örn: TRY).");
        setErrors(prev => ({ ...prev, currency: ["Para birimi 3 karakter olmalı."] }));
        return;
    }
    // Opsiyonel: Trailer URL formatını basitçe kontrol et
    if (trailerUrl && trailerUrl.trim() !== '' && !trailerUrl.startsWith('http')) {
        toast.error("Fragman URL'i geçerli bir URL olmalıdır (http:// veya https:// ile başlamalı).");
        setErrors(prev => ({ ...prev, trailerUrl: ["Geçerli bir URL girin."] }));
        return;
    }


    const loadingToastId = toast.loading(isEditing ? 'Proje güncelleniyor...' : 'Proje oluşturuluyor...');
    let finalCoverIdToSubmit = currentCoverPublicId;
    let finalBannerIdToSubmit = currentBannerPublicId;
    startTransition(async () => {
      
      if (selectedCoverFile) {
            const uploadedId = await handleImageUpload(selectedCoverFile, 'projectCover', slug || title, initialProjectData?.id);
            if (!uploadedId) { toast.dismiss(loadingToastId); return; }
            finalCoverIdToSubmit = uploadedId;
        }
        if (selectedBannerFile) {
            const uploadedId = await handleImageUpload(selectedBannerFile, 'projectBanner', slug || title, initialProjectData?.id);
            if (!uploadedId) { toast.dismiss(loadingToastId); return; }
            finalBannerIdToSubmit = uploadedId;
        }

      const assignmentsForApi = currentAssignments.map(asn => {
      const apiAssignment: { artistId: number; role: RoleInProject; characterIds?: number[] } = {
            artistId: asn.artistId,
            role: asn.role,
        };
        if (asn.role === RoleInProject.VOICE_ACTOR && asn.characterIds && asn.characterIds.length > 0) {
            apiAssignment.characterIds = asn.characterIds;
        }
        return apiAssignment;
      });

      const payload: ApiPayload = {
        title: title.trim(),
        slug: slug.trim(),
        type: projectType,
        description: description && description.trim() !== '' ? description.trim() : null,
        coverImagePublicId: finalCoverIdToSubmit,
        bannerImagePublicId: finalBannerIdToSubmit,
        releaseDate: releaseDate ? new Date(releaseDate).toISOString() : null,
        isPublished,
        price: projectType === 'oyun' && price.trim() !== '' ? parseFloat(price) : null,
        currency: projectType === 'oyun' && price.trim() !== '' && currency.trim() !== '' ? currency.trim().toUpperCase() : null,
        assignments: assignmentsForApi,
        categoryIds: selectedCategoryIds,
        externalWatchUrl: externalWatchUrl && externalWatchUrl.trim() !== '' ? externalWatchUrl.trim() : null,
        trailerUrl: trailerUrl && trailerUrl.trim() !== '' ? trailerUrl.trim() : null, // YENİ: payload'a ekle
      };

      let finalPayloadToSend: Partial<ApiPayload> = { ...payload };
      if (!isEditing) {
        // Yeni proje oluşturulurken assignments'ı göndermiyoruz (önce proje oluşmalı)
        // Sen zaten EditProjectForm'u yeni proje için de kullanıyorsun ama assignments ayrı yönetiliyor.
        // Bu kısım AddProjectForm'daki mantıkla daha uyumlu olmalı.
        // AddProjectForm'da assignments'ı POST request'e dahil ediyorsun.
        // Bu durumda, eğer EditProjectForm hem yeni hem düzenleme için kullanılıyorsa
        // ve yeni proje için assignments gönderilecekse, bu delete'i kaldırmalısın.
        // Şimdilik AddProjectForm'daki gibi bırakıyorum, yani yeni projede de assignments gidecek.
        // Eğer yeni projede assignments gönderilmeyecekse, aşağıdaki satırı aktif et:
        // delete finalPayloadToSend.assignments; 
      }


      const apiUrl = isEditing && initialProjectData?.slug ? `/api/admin/projects/${initialProjectData.slug}` : '/api/admin/projects';
      const apiMethod = isEditing ? 'PUT' : 'POST';

      try {
        const response = await fetch(apiUrl, {
          method: apiMethod,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json(); 
        toast.dismiss(loadingToastId);

        if (!response.ok) {
            if (data.errors && typeof data.errors === 'object') {
                setErrors(data.errors as FormErrors);
                const firstErrorField = Object.keys(data.errors)[0] as keyof FormErrors;
                if (firstErrorField && data.errors[firstErrorField]?.[0]) {
                    toast.error(`${data.errors[firstErrorField][0]}`); 
                } else {
                    toast.error(data.message || 'Bir hata oluştu.');
                }
            } else {
                setErrors({ general: data.message || 'Bir hata oluştu.' });
                toast.error(data.message || 'Bir hata oluştu.');
            }
            return;
        }

        toast.success(`Proje başarıyla ${isEditing ? 'güncellendi' : 'oluşturuldu'}.`);
        setSelectedCoverFile(null); 
        setSelectedBannerFile(null);
        
        if (!isEditing && data.slug) { // Yeni proje oluşturulduysa ve slug döndüyse
            router.push(`/admin/projeler/duzenle/${data.slug}`); 
        } else if (isEditing) {
            if (data.slug && data.slug !== initialProjectData?.slug) { // Slug değiştiyse yeni slug'a yönlendir
                router.push(`/admin/projeler/duzenle/${data.slug}`);
            } else {
                router.refresh(); // Sadece veriyi yenile
            }
        }
      } catch (err: any) {
        toast.dismiss(loadingToastId);
        toast.error(err.message || 'Bir ağ hatası oluştu.');
        setErrors({ general: 'Bir ağ hatası oluştu. Lütfen internet bağlantınızı kontrol edin.' });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {errors.general && ( <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300" role="alert">{errors.general}</div> )}

      <ProjectDetailsFields
        title={title} onTitleChange={setTitle}
        slug={slug} onSlugChange={setSlug}
        projectType={projectType} onProjectTypeChange={setProjectType}
        description={description} onDescriptionChange={setDescription}
        releaseDate={releaseDate} onReleaseDateChange={setReleaseDate}
        externalWatchUrl={externalWatchUrl}
        onExternalWatchUrlChange={setExternalWatchUrl}
        trailerUrl={trailerUrl} onTrailerUrlChange={setTrailerUrl}
        errors={errors}
      />
      {/* Sadece Anime ise göster */}
      {projectType === 'anime' && (
        <div className="border-b border-gray-900/10 dark:border-gray-700 pb-10">
          <h2 className="text-lg font-semibold leading-7 text-gray-900 dark:text-gray-100">Anime İzleme Linki</h2>
          <div className="mt-6">
            <label htmlFor="externalWatchUrl" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
              Harici İzleme URL'i
            </label>
            <div className="mt-2">
              <input
                type="url"
                name="externalWatchUrl"
                id="externalWatchUrl"
                value={externalWatchUrl}
                onChange={(e) => setExternalWatchUrl(e.target.value)}
                placeholder="https://ornek-anime-sitesi.com/anime-adi"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800"
              />
            </div>
            {errors.externalWatchUrl && <p className="mt-1 text-xs text-red-500">{errors.externalWatchUrl.join(', ')}</p>}
          </div>
        </div>
      )}

      <ProjectImagesManager
        coverImagePublicId={currentCoverPublicId}
        onCoverImagePublicIdChange={setCurrentCoverPublicId} 
        onCoverFileSelect={setSelectedCoverFile}
        bannerImagePublicId={currentBannerPublicId}
        onBannerImagePublicIdChange={setCurrentBannerPublicId}
        onBannerFileSelect={setSelectedBannerFile}
        initialCoverId={initialProjectData?.coverImagePublicId}
        initialBannerId={initialProjectData?.bannerImagePublicId}
        errors={errors}
      />

      {projectType === 'oyun' && (
        <ProjectPricingFields
          price={price} onPriceChange={setPrice}
          currency={currency} onCurrencyChange={setCurrency}
          errors={errors}
        />
      )}

      <ProjectCategoriesSelect
        allCategoriesForSelect={initialAllCategoriesData}
        selectedCategoryIds={selectedCategoryIds}
        onSelectedCategoriesChange={setSelectedCategoryIds}
        errors={errors}
      />
      
      {isEditing && initialProjectData?.slug && initialProjectData?.id && ( 
        <ProjectCharactersManager
        projectSlug={initialProjectData?.slug} 
        projectId={initialProjectData?.id}    
        onCharactersUpdate={setProjectCharacters}
        isFormPending={isPending}
        isEditing={isEditing} 
      />
      )}

      <ProjectAssignmentsManager
        allArtists={allArtists}
        availableRoles={availableRoles}
        projectCharactersForSelect={projectCharacters.map(char => ({ value: char.id, label: char.name }))}
        initialAssignments={currentAssignments}
        onAssignmentsChange={setCurrentAssignments}
        isFormPending={isPending}
        isEditing={isEditing} 
      />

      <ProjectPublishSettings
        isPublished={isPublished}
        onIsPublishedChange={setIsPublished}
        errors={errors}
      />


      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button type="button" onClick={() => router.back()} className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-1.5 rounded-md">
          İptal
        </button>
        <button type="submit" disabled={isPending} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:ring-offset-gray-800">
          {isPending ? (isEditing ? 'Güncelleniyor...' : 'Oluşturuluyor...') : (isEditing ? 'Değişiklikleri Kaydet' : 'Projeyi Oluştur')}
        </button>
      </div>
    </form>
  );
}