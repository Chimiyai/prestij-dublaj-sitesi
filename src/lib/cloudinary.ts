const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// --- DEĞİŞİKLİK 1: `flags` özelliğini tipe ekliyoruz ---
interface CloudinaryTransformations {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'thumb' | 'scale' | string;
  gravity?: string;
  quality?: string | number;
  format?: 'auto' | 'webp' | 'png' | 'jpg' | 'mp3' | 'wav';
  radius?: string | number;
  effect?: string;
  resource_type?: 'image' | 'video' | 'raw';
  flags?: string; // YENİ: Cloudinary flag'lerini desteklemek için
}

export function getCloudinaryImageUrlOptimized(
  publicIdOrPath: string | null | undefined,
  transformations: CloudinaryTransformations = {},
  placeholderType?: 'banner' | 'cover' | 'avatar' | null
): string {
  if (!publicIdOrPath) {
    if (placeholderType === 'banner') return '/images/placeholder-banner.jpg';
    if (placeholderType === 'cover') return '/images/placeholder-cover.jpg';
    if (placeholderType === 'avatar') return '/images/default-avatar.png';
    return '/images/placeholder-banner.jpg';
  }

  if (publicIdOrPath.startsWith('http') || publicIdOrPath.startsWith('/')) {
    return publicIdOrPath;
  }

  if (!CLOUDINARY_CLOUD_NAME) {
    console.warn("Cloudinary cloud name is not configured.");
    return '/images/placeholder-banner.jpg';
  }

  const resourceType = transformations.resource_type || 'image';
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
  
  // --- DEĞİŞİKLİK 2: Mantığı, video için de flag'leri destekleyecek şekilde güncelliyoruz ---
  const transParts: string[] = [];

  // Resimlere özel dönüşümler
  if (resourceType === 'image') {
    if (transformations.width) transParts.push(`w_${transformations.width}`);
    if (transformations.height) transParts.push(`h_${transformations.height}`);
    if (transformations.crop) transParts.push(`c_${transformations.crop}`);
    if (transformations.gravity) transParts.push(`g_${transformations.gravity}`);
    if (transformations.radius) transParts.push(`r_${transformations.radius}`);
    transParts.push(`q_${transformations.quality || 'auto'}`);
    transParts.push(`f_${transformations.format || 'auto'}`);
  }

  // Hem resim hem video için geçerli olabilecek dönüşümler
  if (transformations.flags) transParts.push(`fl_${transformations.flags}`);
  // (Buraya gelecekte başka ortak dönüşümler de eklenebilir)

  const transformString = transParts.join(',');

  return `${baseUrl}/${transformString ? transformString + '/' : ''}${publicIdOrPath}`;
}