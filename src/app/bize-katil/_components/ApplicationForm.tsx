// src/app/bize-katil/_components/ApplicationForm.tsx
'use client';

import { ChangeEvent, FormEvent, useState, Fragment } from 'react'; // Fragment'ı import et
import { ApplicationFormData, SocialLink } from './BizeKatilClientPage';
import { PlusIcon, TrashIcon, UserCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'; // ExclamationTriangleIcon'u import et
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react'; // headlessui'yi import et

// Statik Rol Listesi
const availableRoles = [
    'Seslendirme Sanatçısı', 'Çevirmen', 'Editör',
    'SFX/VFX', 'Mod Geliştiricisi'
];

// Eklenebilecek Sosyal Medya Platformları
const availablePlatforms: SocialLink['platform'][] = [
  'Twitter', 'Instagram', 'Youtube', 'Website', 'Linkedin', 'Github'
];

interface ApplicationFormProps {
  formData: ApplicationFormData;
  setFormData: React.Dispatch<React.SetStateAction<ApplicationFormData>>;
}

export function ApplicationForm({ formData, setFormData }: ApplicationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialLink['platform']>(availablePlatforms[0]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRolesChange = (newRoles: string[]) => {
    setFormData(prev => ({ ...prev, roles: newRoles }));
  };

  const handleAddSocialLink = () => {
    if (formData.socialLinks.some(link => link.platform === selectedPlatform)) return;
    setFormData(prev => ({ ...prev, socialLinks: [...prev.socialLinks, { platform: selectedPlatform, url: '' }] }));
  };
  const handleSocialLinkChange = (index: number, url: string) => {
    setFormData(prev => { const newLinks = [...prev.socialLinks]; newLinks[index].url = url; return { ...prev, socialLinks: newLinks }; });
  };
  const handleRemoveSocialLink = (platform: string) => {
    setFormData(prev => ({ ...prev, socialLinks: prev.socialLinks.filter(link => link.platform !== platform) }));
  };

  const handleProfileImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Lütfen bir resim dosyası seçin.'); return; }
    if (file.size > 4 * 1024 * 1024) { toast.error('Dosya boyutu en fazla 4MB olabilir.'); return; }

    setIsUploading(true);
    const toastId = toast.loading('Resim yükleniyor...');
    const temporaryPreviewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, profileImage: { publicId: 'uploading', url: temporaryPreviewUrl } }));

    const uploadFormData = new FormData();
    uploadFormData.append('imageFile', file);
    uploadFormData.append('uploadContext', 'applicationProfile');

    try {
      const response = await fetch('/api/image-upload', { method: 'POST', body: uploadFormData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Resim yüklenemedi.');
      
      // BAŞARILI YÜKLEME SONRASI: State'i GERÇEK Cloudinary verileriyle güncelle
      setFormData(prev => ({
        ...prev,
        profileImage: {
          publicId: result.publicId, // Örn: "artist_applications/..."
          url: result.secureUrl     // Örn: "https://res.cloudinary.com/..."
        }
      }));
      
      URL.revokeObjectURL(temporaryPreviewUrl); // Geçici URL'i temizle
      toast.success('Profil resmi başarıyla yüklendi!', { id: toastId });
    } catch (error) {
      toast.error((error as Error).message, { id: toastId });
      setFormData(prev => ({ ...prev, profileImage: null }));
      URL.revokeObjectURL(temporaryPreviewUrl);
    } finally {
      setIsUploading(false);
    }
  };
  
  // 1. Ana "Başvuruyu Gönder" butonunun tetikleyeceği fonksiyon
  const handleOpenConfirmation = (e: FormEvent) => {
    e.preventDefault();
    
    if (formData.roles.length === 0) { toast.error('Lütfen en az bir unvan/yetenek seçin.'); return; }
    if (!formData.profileImage || formData.profileImage.publicId === 'uploading') { toast.error('Lütfen bir profil fotoğrafı yükleyin ve yüklemenin bitmesini bekleyin.'); return; }
    if (!formData.workSampleUrl.trim()) { toast.error('Lütfen çalışma örneği linkini girin.'); return; }

    setIsConfirmModalOpen(true);
  };

  // 2. Modal'ın içindeki "Onayla ve Gönder" butonunun tetikleyeceği asıl gönderme fonksiyonu
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsSubmitting(true);
    const toastId = toast.loading('Başvurunuz gönderiliyor...');

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      roles: formData.roles,
      bio: formData.bio,
      socialLinks: formData.socialLinks,
      profileImagePublicId: formData.profileImage!.publicId, // Non-null assertion, çünkü yukarıda kontrol ettik
      workSampleUrl: formData.workSampleUrl,
    };

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Başvuru gönderilemedi.');
      
      toast.success('Başvurunuz başarıyla alındı! Teşekkür ederiz.', { id: toastId, duration: 4000 });
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingPlatforms = availablePlatforms.filter(p => !formData.socialLinks.some(link => link.platform === p));

  return (
    <>
      <Transition appear show={isConfirmModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsConfirmModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-[#08060D] border border-gray-600 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-900/50 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-4 text-left">
                      <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-white">
                        Başvuruyu Onayla
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-300">
                          Başvurunuzun kabul edilmesi durumunda, formda belirttiğiniz isim, soyisim, bio, profil resmi ve sosyal medya linkleri gibi kişisel bilgilerinizin "Kadromuz" sayfasında herkese açık olarak yayınlanacağını anlıyor ve kabul ediyor musunuz?
                        </p>
                        <p className='text-xs text-gray-500 mt-2'>
                          Telefon numarası gibi iletişim bilgileriniz kesinlikle gizli tutulacaktır.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Gönderiliyor...' : 'Onayla ve Gönder'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-base font-medium text-gray-200 shadow-sm hover:bg-gray-600 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => setIsConfirmModalOpen(false)}
                    >
                      İptal
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Ana Form (onSubmit değiştirildi) */}
      <form onSubmit={handleOpenConfirmation} className="space-y-6 p-6 sm:p-8 bg-gray-900/50 border border-gray-800 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-4">Başvuru Formu</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label htmlFor="firstName" className="form-label">İsim *</label><input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleInputChange} className="form-input" required /></div>
        <div><label htmlFor="lastName" className="form-label">Soyisim *</label><input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleInputChange} className="form-input" required /></div>
      </div>
      <div>
        <label htmlFor="phoneNumber" className="form-label">Telefon Numarası (Opsiyonel)</label>
        <input 
          type="tel" 
          name="phoneNumber" 
          id="phoneNumber" 
          value={formData.phoneNumber} 
          onChange={handleInputChange} 
          className="form-input" 
          placeholder="Örn: 555 123 4567"
        />
        <p className="text-xs text-gray-500 mt-1">Numaranız Başvurunuzun Kabul Edildiğinde Whatsapp üzerinden Grubumuza Eklenilecektir.</p>
      </div>
      <div>
        <label htmlFor="roles" className="form-label">Unvanların / Yeteneklerin *</label>
        <MultiSelectDropdown options={availableRoles} selected={formData.roles} onChange={handleRolesChange} placeholder="Unvanlarınızı seçin..."/>
      </div>
      <div>
        <label htmlFor="bio" className="form-label">Kendini Tanıt (Bio)</label>
        <textarea name="bio" id="bio" rows={4} value={formData.bio} onChange={handleInputChange} className="form-input" placeholder="Yetenekleriniz, tecrübeleriniz..."></textarea>
      </div>
      <div className="border-t border-gray-800 pt-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Sosyal Medya Linkleri</h3>
        {formData.socialLinks.map((link, index) => (
          <div key={link.platform} className="flex items-center gap-2">
            <label htmlFor={link.platform} className="w-24 flex-shrink-0 text-sm text-gray-400">{link.platform}</label>
            <input type="url" id={link.platform} value={link.url} onChange={(e) => handleSocialLinkChange(index, e.target.value)} className="form-input flex-grow" placeholder={`https://${link.platform.toLowerCase()}.com/...`} />
            <button type="button" onClick={() => handleRemoveSocialLink(link.platform)} className="p-2 text-red-500 hover:text-red-400"><TrashIcon className="w-5 h-5"/></button>
          </div>
        ))}
        {remainingPlatforms.length > 0 && (
          <div className="flex items-end gap-2 pt-2">
            <div className="flex-grow">
              <label htmlFor="platformSelect" className="form-label">Eklenecek Platform</label>
              <select id="platformSelect" value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value as SocialLink['platform'])} className="form-input">
                {remainingPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <button type="button" onClick={handleAddSocialLink} className="flex-shrink-0 flex items-center gap-1.5 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 font-medium py-2 px-3 rounded-md text-sm">
              <PlusIcon className="w-5 h-5" /> Ekle
            </button>
          </div>
        )}
      </div>

      {/* Dosya Yükleme Alanları */}
      <div className="border-t border-gray-800 pt-6 space-y-4">
      <h3 className="text-lg font-semibold text-white">Gerekli Dosyalar</h3>
        <div>
          <label className="form-label">Profil Fotoğrafı (Özçekim/pp) *</label>
          <div className="mt-2 flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[#110E1B] border border-[#37304F] flex items-center justify-center overflow-hidden">
              {formData.profileImage?.url ? (<Image src={formData.profileImage.url} alt="Önizleme" width={80} height={80} className="object-cover w-full h-full" />) : (<UserCircleIcon className="w-12 h-12 text-gray-600" />)}
            </div>
            <label htmlFor="profile-image-upload" className="relative cursor-pointer rounded-md bg-indigo-600/20 text-indigo-300 font-semibold px-4 py-2 hover:bg-indigo-600/40 transition-colors">
              <span>{isUploading ? 'Yükleniyor...' : 'Resim Seç'}</span>
              <input id="profile-image-upload" name="profile-image-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleProfileImageChange} disabled={isUploading} />
            </label>
          </div>
        </div>
        <div>
          <label htmlFor="workSampleUrl" className="form-label">Çalışma Örneği Linki (Google Drive vb.) *</label>
          <input type="url" name="workSampleUrl" id="workSampleUrl" value={formData.workSampleUrl} onChange={(e) => setFormData(prev => ({ ...prev, workSampleUrl: e.target.value }))} className="form-input" placeholder="https://drive.google.com/..." required/>
          <p className="text-xs text-gray-500 mt-1">Lütfen linkin "herkesin erişimine açık" olduğundan emin olun.</p>
        </div>
      </div>
      <div className="pt-4 border-t border-gray-800">
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting || isUploading}>
            {isSubmitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
          </button>
        </div>
      </form>
    </>
  );
};