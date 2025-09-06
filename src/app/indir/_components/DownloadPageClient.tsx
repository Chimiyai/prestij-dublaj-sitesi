// src/app/indir/_components/DownloadPageClient.tsx (YENİ DOSYA)
'use client'; // <<< BU DİREKTİF EN ÖNEMLİSİ

import Link from 'next/link';
import { Download } from 'lucide-react';
import { DownloadPageSlider } from './DownloadPageSlider';

// page.tsx'den gelecek verilerin tipini tanımlayalım
interface DownloadPageClientProps {
  stats: {
    totalDubbedGames: number;
    totalTeamMembers: number;
  };
  projectsForSlider: {
    title: string;
    slug: string;
    coverImagePublicId: string | null;
  }[];
  downloadLink: string;
}

export function DownloadPageClient({ stats, projectsForSlider, downloadLink }: DownloadPageClientProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: '#08060D' }}>
      {/* Arka plan gradyanı ve desenleri */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute bottom-0 left-0 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 flex min-h-screen items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-white text-shadow-sm">
              Dublaj Dünyasına
              {/* style jsx bloğu artık burada, bir Client Component içinde */}
              <span className="block mt-1 sm:mt-2">
                <span style={{
                    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)',
                    backgroundSize: '400% 400%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'rainbow 3s ease-in-out infinite, glow 2s ease-in-out infinite alternate',
                  }}>
                  Adım Atın
                </span>
                <style jsx>{`
                  @keyframes rainbow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }
                  @keyframes glow {
                    0% { 
                      filter: drop-shadow(0 0 10px rgba(255, 107, 107, 0.5));
                      transform: scale(1);
                    }
                    100% { 
                      filter: drop-shadow(0 0 20px rgba(255, 107, 107, 0.8));
                      transform: scale(1.05);
                    }
                  }
                  /* Gerekirse daha karmaşık stilleri buraya ekleyebilirsiniz */
                `}</style>
              </span>
            </h1>
            <p className="mt-6 text-lg max-w-xl mx-auto lg:mx-0 text-gray-300">
              Türkçe dublaj modlarımızla oyun maceralarınızı daha önce hiç olmadığı kadar sürükleyici hale getirin. Tek tıkla indirin ve ana dilinizde oyun oynamanın keyfini çıkarın.
            </p>

            <div className="mt-8 flex justify-center lg:justify-start items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{stats.totalDubbedGames}+</p>
                <p className="text-sm text-gray-400">Dublajlı Oyun</p>
              </div>
              <div className="h-10 w-px bg-gray-800"></div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{stats.totalTeamMembers}</p>
                <p className="text-sm text-gray-400">Ekip Üyesi</p>
              </div>
            </div>

            <div className="mt-10">
              <Link href={downloadLink} className="inline-flex items-center justify-center gap-3 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all transform hover:scale-105">
                <Download className="w-6 h-6" />
                <span>Hemen İndir (v1.0)</span>
              </Link>
              <p className="text-xs text-gray-500 mt-3">Windows için | Ücretsiz</p>
            </div>
          </div>

          <div className="w-full h-full flex items-center justify-center">
            <DownloadPageSlider projects={projectsForSlider} />
          </div>

        </div>
      </div>
    </div>
  );
}