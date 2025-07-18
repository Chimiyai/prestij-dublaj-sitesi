'use client';

import { useState, useTransition, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'; // Session güncelleme için (opsiyonel)

interface UpdateUsernameFormProps {
  currentUsername: string; // Mevcut kullanıcı adını prop olarak alalım
}

interface FormErrors {
  username?: string[];
  general?: string;
}

export default function UpdateUsernameForm({ currentUsername }: UpdateUsernameFormProps) {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession(); // Session ve update fonksiyonu
  const [username, setUsername] = useState(currentUsername);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    // Eğer kullanıcı adı değişmediyse bir şey yapma
    if (username.trim() === currentUsername) {
      setErrors({ general: 'Yeni kullanıcı adı mevcut olanla aynı.' });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: username.trim() }), // Sadece username gönder
        });

        const data = await response.json();

        if (!response.ok) {
          const serverErrors: FormErrors = {};
           if (data.errors) {
             for (const key in data.errors) {
                 if (Object.prototype.hasOwnProperty.call(data.errors, key)) {
                     serverErrors[key as keyof FormErrors] = data.errors[key];
                 }
             }
           }
           if(data.message && !Object.keys(serverErrors).length) {
               serverErrors.general = data.message;
           } else if (!Object.keys(serverErrors).length) {
                serverErrors.general = 'Kullanıcı adı güncellenirken bilinmeyen bir hata oluştu.';
           }
           setErrors(serverErrors);
          return;
        }

        setSuccessMessage(data.message || 'Kullanıcı adı başarıyla güncellendi!');
        
        // --- Opsiyonel: Session'ı Güncelle (Navbar'da anında yansıması için) ---
        // Dikkat: Bu işlem session objesinin tamamını güncellemeyi gerektirebilir
        // ve NextAuth konfigürasyonuna bağlıdır.
        await updateSession({ 
            ...session, // Mevcut session verileri
            user: { 
                ...session?.user, // Diğer user verileri
                name: data.user.username // Session'daki 'name' alanını güncelle (eğer kullanılıyorsa)
            } 
        });
        // -----------------------------------------------------------------------

        // Sayfayı yenilemek yerine sadece router.refresh() daha hafif olabilir,
        // çünkü session update'i zaten client tarafında state'i tetikler.
        router.refresh(); // Sunucudan güncel veriyi çekmek için (profil sayfasını yeniler)

        // Başarı mesajını birkaç saniye sonra temizle
        setTimeout(() => setSuccessMessage(null), 4000);


      } catch (err) {
        console.error('Kullanıcı adı güncelleme formu gönderim hatası:', err);
        setErrors({ general: 'Güncelleme sırasında bir ağ hatası oluştu.' });
      }
    });
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Kullanıcı Adını Güncelle</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {successMessage && (
          <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-900 dark:text-green-300" role="alert">
            {successMessage}
          </div>
        )}
         {errors.general && (
           <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300" role="alert">
              {errors.general}
           </div>
        )}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Yeni Kullanıcı Adı
          </label>
          <input
            type="text"
            name="username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={30}
            pattern="^[a-zA-Z0-9_]+$" // API'deki regex ile aynı olmalı
            title="Sadece harf, rakam ve alt çizgi (_)"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
          />
           {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.join(', ')}</p>}
        </div>
        <div>
          <button
            type="submit"
            disabled={isPending || username.trim() === currentUsername} // Değişiklik yoksa veya işlem sırasındaysa pasif
            className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isPending ? 'Güncelleniyor...' : 'Kullanıcı Adını Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}