// src/components/profile/RecoveryCodeManager.tsx
'use client';

import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import { KeyRound, RefreshCw, Copy, Check } from 'lucide-react';

export default function RecoveryCodeManager() {
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [hasCopied, setHasCopied] = useState(false);

  const generateNewCode = () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/generate-recovery', {
          method: 'POST',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Kod üretilemedi.');
        
        setRecoveryCode(data.recoveryCode);
        toast.success('Yeni kurtarma kodu oluşturuldu!');
        setHasCopied(false); // Yeni kod gelince kopyalama durumunu sıfırla
      
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  };

  const copyToClipboard = () => {
    if (!recoveryCode) return;
    navigator.clipboard.writeText(recoveryCode);
    setHasCopied(true);
    toast.success('Kod panoya kopyalandı!');
    setTimeout(() => setHasCopied(false), 2000); // 2 saniye sonra ikonu geri değiştir
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
        <KeyRound size={20} /> Kurtarma Kodu
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Şifrenizi unutmanız durumunda hesabınıza erişmek için bu kodu kullanacaksınız. Lütfen bu kodu güvenli bir yere kaydedin.
      </p>
      
      <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-between gap-4">
        <code className="text-lg font-mono text-indigo-500 dark:text-indigo-400 break-all">
          {recoveryCode ? recoveryCode : 'Yeni bir kod oluşturun'}
        </code>
        {recoveryCode && (
          <button onClick={copyToClipboard} className="p-2 text-gray-500 hover:text-gray-200 transition-colors">
            {hasCopied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          </button>
        )}
      </div>
      
      <button
        onClick={generateNewCode}
        disabled={isPending}
        className="mt-4 w-full sm:w-auto inline-flex items-center gap-2 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
      >
        {isPending ? 'Oluşturuluyor...' : 'Yeni Kod Oluştur'}
        {!isPending && <RefreshCw size={16} />}
      </button>
      <p className="text-xs text-gray-500 mt-2">
        Yeni bir kod oluşturmak, eskisini geçersiz kılacaktır.
      </p>
    </div>
  );
}