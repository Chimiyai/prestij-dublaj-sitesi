// src/components/profile/ArtistProfileEditor.tsx
'use client';

import { useState, FormEvent } from 'react';
import { DubbingArtist } from '@prisma/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/admin/ImageUploader'; // Bu bileşeni yeniden kullanabiliriz
import slugify from 'slugify';

interface ArtistProfileEditorProps {
  artistProfile: DubbingArtist;
}

export default function ArtistProfileEditor({ artistProfile }: ArtistProfileEditorProps) {
  const [formData, setFormData] = useState({
    firstName: artistProfile.firstName || '',
    lastName: artistProfile.lastName || '',
    slug: artistProfile.slug || '',
    bio: artistProfile.bio || '',
    siteRole: artistProfile.siteRole || '',
    websiteUrl: artistProfile.websiteUrl || '',
    twitterUrl: artistProfile.twitterUrl || '',
    instagramUrl: artistProfile.instagramUrl || '',
    youtubeUrl: artistProfile.youtubeUrl || '',
  });
  const [imagePublicId, setImagePublicId] = useState(artistProfile.imagePublicId);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // İsim/soyisim değişirse slug'ı otomatik öner
    if (name === 'firstName' || name === 'lastName') {
        const newFirstName = name === 'firstName' ? value : formData.firstName;
        const newLastName = name === 'lastName' ? value : formData.lastName;
        const newSlug = slugify(`${newFirstName} ${newLastName}`, { lower: true, strict: true });
        setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  };

  const handleImageUpload = async (): Promise<string | null> => {
    if (!selectedFile) return imagePublicId; // Dosya seçilmemişse mevcut ID'yi döndür
    
    const uploadFormData = new FormData();
    uploadFormData.append('imageFile', selectedFile);
    uploadFormData.append('uploadContext', 'artistProfile');
    uploadFormData.append('identifier', artistProfile.id.toString());
    
    const toastId = toast.loading('Resim yükleniyor...');
    try {
      const res = await fetch('/api/image-upload', { method: 'POST', body: uploadFormData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Resim yüklenemedi.');
      toast.success('Resim güncellendi!', { id: toastId });
      return data.publicId;
    } catch (error) {
      toast.error((error as Error).message, { id: toastId });
      return null;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading('Profil güncelleniyor...');

    const newImagePublicId = await handleImageUpload();
    if (selectedFile && !newImagePublicId) {
        setIsSubmitting(false);
        toast.dismiss(toastId);
        return; // Resim yükleme başarısız olursa formu gönderme
    }

    try {
      const res = await fetch('/api/profile/artist-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, imagePublicId: newImagePublicId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Profil güncellenemedi.');

      toast.success('Sanatçı profiliniz başarıyla güncellendi!', { id: toastId });
      router.refresh(); // Sayfadaki verileri (session dahil) yenilemek için
    } catch (error) {
      toast.error((error as Error).message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="form-label">İsim</label><input name="firstName" value={formData.firstName} onChange={handleInputChange} className="form-input" required /></div>
        <div><label className="form-label">Soyisim</label><input name="lastName" value={formData.lastName} onChange={handleInputChange} className="form-input" required /></div>
      </div>
      <div><label className="form-label">Slug</label><input name="slug" value={formData.slug} onChange={handleInputChange} className="form-input" /></div>
      <div><label className="form-label">Sitedeki Unvan (Opsiyonel)</label><input name="siteRole" value={formData.siteRole} onChange={handleInputChange} className="form-input" /></div>
      <div><label className="form-label">Biyografi</label><textarea name="bio" value={formData.bio} onChange={handleInputChange} className="form-input" rows={4} /></div>
      
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Profil Resmi</h3>
        <ImageUploader
            currentImagePublicId={imagePublicId}
            onFileSelect={(file) => {
                setSelectedFile(file);
                if (file) setImagePublicId(URL.createObjectURL(file));
                else setImagePublicId(artistProfile.imagePublicId);
            }}
            aspectRatio="aspect-square"
            label="Resmi Değiştir"
        />
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Sosyal Medya Linkleri</h3>
        <div className="space-y-4">
          <div><label className="form-label">Website</label><input type="url" name="websiteUrl" value={formData.websiteUrl} onChange={handleInputChange} className="form-input" placeholder="https://..." /></div>
          <div><label className="form-label">Twitter</label><input type="url" name="twitterUrl" value={formData.twitterUrl} onChange={handleInputChange} className="form-input" placeholder="https://twitter.com/..." /></div>
          <div><label className="form-label">Instagram</label><input type="url" name="instagramUrl" value={formData.instagramUrl} onChange={handleInputChange} className="form-input" placeholder="https://instagram.com/..." /></div>
          <div><label className="form-label">Youtube</label><input type="url" name="youtubeUrl" value={formData.youtubeUrl} onChange={handleInputChange} className="form-input" placeholder="https://youtube.com/..." /></div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-700">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </div>
    </form>
  );
}