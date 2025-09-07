// src/lib/cloudinary.ts (SİZİN KODUNUZUN DÜZELTİLMİŞ VE NİHAİ HALİ)

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

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

  // <<< MANTIKSAL DÜZELTME BURADA BAŞLIYOR <<<

  // EĞER KAYNAK TİPİ VİDEO/SES İSE, HİÇBİR DÖNÜŞÜM UYGULAMA VE URL'İ HEMEN DÖNDÜR
  if (resourceType === 'video') {
    // Bu, en basit, en ham ve en güvenilir URL'dir.
    return `${baseUrl}/${publicIdOrPath}`;
  }

  // EĞER KAYNAK TİPİ VİDEO DEĞİLSE (YANİ IMAGE İSE), DÖNÜŞÜM MANTIĞINA DEVAM ET
  const transParts: string[] = [];
  
  if (transformations.width) transParts.push(`w_${transformations.width}`);
  if (transformations.height) transParts.push(`h_${transformations.height}`);
  if (transformations.crop) transParts.push(`c_${transformations.crop}`);
  if (transformations.gravity) transParts.push(`g_${transformations.gravity}`);
  if (transformations.radius) transParts.push(`r_${transformations.radius}`);
  
  // Bu satırlar artık sadece resimler için çalışacak
  transParts.push(`q_${transformations.quality || 'auto'}`);
  transParts.push(`f_${transformations.format || 'auto'}`);
  
  const transformString = transParts.join(',');

  return `${baseUrl}/${transformString ? transformString + '/' : ''}${publicIdOrPath}`;
  // >>> MANTIKSAL DÜZELTME BURADA BİTİYOR >>>
}