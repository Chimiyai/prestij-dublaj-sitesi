// src/app/page.tsx
import { Metadata } from 'next';
import HeroSection from "@/components/home/HeroSection";
import DubbedGamesSection from "@/components/home/DubbedGamesSection";
import DubbedAnimeSection from "@/components/home/DubbedAnimeSection";
import PopularContentSection from "@/components/home/PopularContentSection";
import SuggestGameSection from "@/components/home/SuggestGameSection";
import CountdownSection from "@/components/home/CountdownSection";
import JoinDiscordSection from "@/components/home/JoinDiscordSection";

export const metadata: Metadata = {
  title: 'PrestiJ | Oyunlar için Türkçe Dublaj Projeleri',
  description: 'PrestiJ, popüler video oyunları için yüksek kaliteli Türkçe dublaj modları geliştiren bir topluluktur. En yeni projelerimizi keşfedin, ekibimizle tanışın ve topluluğumuza katılın.',
  keywords: ['Türkçe Dublaj', 'Türkçe Yama', 'Oyun Dublaj', 'PrestiJ', 'Dublaj Modları', 'Türkçe Seslendirme'],
  openGraph: {
    title: 'PrestiJ | Oyunlar için Türkçe Dublaj Projeleri',
    description: 'Popüler oyunlar için yüksek kaliteli Türkçe dublaj modları.',
    url: 'https://www.prestijstudio.com', // KENDİ DOMAIN ADINIZ
    siteName: 'PrestiJ',
    images: [
      {
        url: 'https://www.prestijstudio.com/images/default-og.jpg', // SİTENİZİN GENEL BİR TANITIM GÖRSELİ
        width: 1200,
        height: 630,
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PrestiJ | Oyunlar için Türkçe Dublaj Projeleri',
    description: 'Popüler oyunlar için yüksek kaliteli Türkçe dublaj modları.',
    images: ['https://www.prestijstudio.com/images/default-og.jpg'], // AYNI TANITIM GÖRSELİ
  },
  // İsteğe bağlı: Google'a sitenizin ana URL'sini belirtmek için
  alternates: {
    canonical: 'https://www.prestijstudio.com',
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <DubbedGamesSection />
      <DubbedAnimeSection />
      <PopularContentSection />
      <SuggestGameSection />
      <CountdownSection />
      <JoinDiscordSection />
    </>
  );
}