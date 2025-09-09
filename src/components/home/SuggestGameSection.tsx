// src/components/home/SuggestGameSection.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import SuggestOptionCard from './SuggestOptionCard';
import { SupportSuggestionModal } from './SupportSuggestionModal';
import { Users, DollarSign } from 'lucide-react';

const SuggestGameSection = () => {
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const openSupportModal = () => setIsSupportModalOpen(true);
  const closeSupportModal = () => setIsSupportModalOpen(false);

  return (
    // <<< DÜZELTME: React Fragment eklendi (<> ve </>)
    <>
      <section className="suggest-game-section bg-suggest-section-bg py-16 md:py-24 relative overflow-hidden min-h-[550px] md:min-h-[500px] lg:min-h-0 lg:py-28">
        <div className="absolute inset-0 z-[1] overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto transform -translate-x-1/2 -translate-y-1/2 object-cover filter brightness-[.4]"
          >
            <source src="/videos/your-main-background-video.mp4" type="video/mp4" />
            Tarayıcınız video etiketini desteklemiyor.
          </video>
          <div className="absolute inset-0 bg-suggest-overlay-bg opacity-70"></div>
        </div>

        <div className="container mx-auto relative z-[2] px-4 md:px-6 lg:px-20 xl:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-1 order-3 lg:order-1">
              <div className="suggest-options-stack flex flex-col gap-5 md:gap-6 w-full max-w-md mx-auto lg:mx-0 lg:max-w-none">
                <SuggestOptionCard
                  title="Destek Vererek Oyun Önerin"
                  description="Bu türü seçersen oyunun çok yüksek ihtimalle kabul edilir."
                  buttonText="Destekle & Öner"
                  Icon={DollarSign}
                  onButtonClick={openSupportModal}
                  isPrimaryAction={true}
                />
                <Link href="/oneriler">
                    {/* Linkin içine doğrudan div koymak bazen anlamsız olabilir,
                        ancak SuggestOptionCard bir div döndürdüğü için bu şekilde kullanmak sorun değil. */}
                    <div className="cursor-pointer">
                        <SuggestOptionCard
                            title="Topluluk Gücüyle Önerin"
                            description="Kullanıcılar bir oyuna belli bir istek sayısından sonra o oyunun dublajına başlayabiliriz."
                            buttonText="Öneri Sayfasına Git"
                            Icon={Users}
                            onButtonClick={() => {}}
                            isPrimaryAction={false}
                        />
                    </div>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-1 order-2 lg:order-2 text-center"> 
              <p className="suggest-terms-text text-sm md:text-base text-suggest-terms-text">
                <Link href="/oyun-istek-sartlari" className="text-suggest-terms-link hover:text-suggest-terms-link-hover border-b border-dotted border-current hover:border-solid">
                  Oyun İstek Şartları
                </Link>
                'nı inceleyebilirsiniz.
              </p>
            </div>
            <div className="lg:col-span-1 order-1 lg:order-3 text-center">
              <h2 className="section-title text-3xl sm:text-4xl md:text-5xl font-bold text-suggest-main-title-text leading-tight text-shadow-suggest-title">
                Daha Fazla Oyun Mu İstiyorsun?
              </h2>
            </div>
          </div>
        </div>
      </section>

      <SupportSuggestionModal 
        isOpen={isSupportModalOpen}
        onClose={closeSupportModal}
      />
    </>
  );
};

export default SuggestGameSection;