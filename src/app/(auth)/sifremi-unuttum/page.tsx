// src/app/(auth)/sifremi-unuttum/page.tsx
'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Masaüstü uygulamasında kullandığımız API'ın aynısını çağırıyoruz
      const response = await fetch('/api/auth/reset-password-with-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, recoveryCode, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Bir hata oluştu.');
      }

      toast.success(data.message || 'Şifreniz başarıyla sıfırlandı!');
      // Başarılı olunca kullanıcıyı giriş sayfasına yönlendir
      router.push('/giris');

    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-prestij-bg-dark-1 shadow-xl rounded-lg">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-prestij-text-primary">Şifre Sıfırla</h1>
        <p className="mt-2 text-prestij-text-muted">
          Hesap bilgilerinizi ve kurtarma kodunuzu girin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-prestij-text-secondary mb-1">
            E-posta veya Kullanıcı Adı
          </label>
          <input
            id="email"
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full pl-3 pr-3 py-2.5 bg-prestij-bg-dark-4 border border-prestij-border-secondary rounded-md shadow-sm placeholder-prestij-text-placeholder focus:outline-none focus:ring-2 focus:ring-prestij-purple focus:border-prestij-purple sm:text-sm text-prestij-text-primary"
            placeholder="Hesabınızın e-postası veya kullanıcı adı"
          />
        </div>
        <div>
          <label htmlFor="recoveryCode" className="block text-sm font-medium text-prestij-text-secondary mb-1">
            Kurtarma Kodu
          </label>
          <input
            id="recoveryCode"
            type="text"
            required
            value={recoveryCode}
            onChange={(e) => setRecoveryCode(e.target.value)}
            className="appearance-none block w-full pl-3 pr-3 py-2.5 bg-prestij-bg-dark-4 border border-prestij-border-secondary rounded-md shadow-sm placeholder-prestij-text-placeholder focus:outline-none focus:ring-2 focus:ring-prestij-purple focus:border-prestij-purple sm:text-sm text-prestij-text-primary"
            placeholder="Güvenli bir yere kaydettiğiniz kod"
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-prestij-text-secondary mb-1">
            Yeni Şifre
          </label>
          <input
            id="newPassword"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="appearance-none block w-full pl-3 pr-3 py-2.5 bg-prestij-bg-dark-4 border border-prestij-border-secondary rounded-md shadow-sm placeholder-prestij-text-placeholder focus:outline-none focus:ring-2 focus:ring-prestij-purple focus:border-prestij-purple sm:text-sm text-prestij-text-primary"
            placeholder="••••••••"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-prestij-purple hover:bg-prestij-purple-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-prestij-purple disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
          </button>
        </div>
      </form>
      <p className="mt-8 text-center text-sm text-prestij-text-muted">
        Şifreni hatırladın mı?{' '}
        <Link href="/giris" className="font-medium text-prestij-purple hover:text-prestij-purple-light hover:underline">
          Giriş Yap
        </Link>
      </p>
    </div>
  );
}