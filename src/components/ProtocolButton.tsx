// src/components/ProtocolButton.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface ProtocolButtonProps {
  protocolUrl: string;
  fallbackUrl: string;
  className?: string;
  children: React.ReactNode;
}

export default function ProtocolButton({ 
  protocolUrl, 
  fallbackUrl, 
  className, 
  children 
}: ProtocolButtonProps) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    // Zamanlayıcıyı kur: 2 saniye sonra fallback URL'e yönlendir.
    timeoutRef.current = setTimeout(() => {
      router.push(fallbackUrl);
    }, 2000);

    // Protokol linkini açmayı dene.
    // Bu, tarayıcının uygulamayı açmasını tetikler.
    window.location.href = protocolUrl;
  };

  useEffect(() => {
    const handleBlur = () => {
      // Sayfa odak dışı kalırsa (yani uygulama açıldıysa),
      // zamanlayıcıyı iptal et.
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    
    // Kullanıcı pencereyi değiştirdiğinde (blur) dinle
    window.addEventListener('blur', handleBlur);

    // Bileşen kaldırıldığında dinleyiciyi temizle
    return () => {
      window.removeEventListener('blur', handleBlur);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}