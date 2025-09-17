// src/components/layout/Footer.tsx
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// API'den gelecek proje verisi için basit bir tip
interface FooterProjectLink {
  slug: string;
  title: string;
  type: 'oyun' | 'anime' | string;
}

// --- DÜZELTİLMİŞ VERİ ÇEKME FONKSİYONU ---
async function fetchLatestFooterItems(type: 'oyun' | 'anime', limit: number): Promise<FooterProjectLink[]> {
  try {
    // 1. HATA DÜZELTİLDİ: `orderBy=createdAt` yerine `sortBy=newest` kullanıldı.
    const res = await fetch(`/api/projects?type=${type}&limit=${limit}&sortBy=newest`);
    
    if (!res.ok) {
      console.error(`Footer için ${type} verisi çekilemedi, status: ${res.status}`);
      return [];
    }
    
    const data = await res.json();

    // 2. HATA DÜZELTİLDİ: Dönen 'data' nesnesinin içindeki 'projects' dizisi map'lendi.
    // data.projects'in bir dizi olduğundan emin olalım.
    if (data && Array.isArray(data.projects)) {
      return data.projects.map((item: any) => ({
        slug: item.slug,
        title: item.title,
        type: item.type,
      }));
    } else {
      console.error(`API'den ${type} için beklenen 'projects' dizisi gelmedi.`);
      return [];
    }

  } catch (error) {
    console.error(`Footer için ${type} fetch hatası:`, error);
    return [];
  }
}


const Footer = () => {
  const [year, setCurrentYear] = useState('');

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  const [gameLinks, setGameLinks] = useState<FooterProjectLink[]>([]);
  const [animeLinks, setAnimeLinks] = useState<FooterProjectLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [games, animes] = await Promise.all([
          fetchLatestFooterItems('oyun', 5),
          fetchLatestFooterItems('anime', 5)
        ]);
        setGameLinks(games);
        setAnimeLinks(animes);
      } catch (error) {
        // Hata zaten fetchLatestFooterItems içinde loglanıyor
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const aboutLinks = [
    { label: "Kadromuz", href: "/kadromuz" },
    { label: "Site Hakkında", href: "/hakkimizda" },
  ];
  const socialLinks = [
    { label: "Instagram", href: "https://www.instagram.com/prestij_studios/", iconClass: "fab fa-instagram" },
    { label: "TikTok", href: "https://www.tiktok.com/@prestijstudiofficial", iconClass: "fab fa-tiktok" },
    { label: "Discord", target:'_blank', href: "https://discord.gg/9hX4GJtEsX", iconClass: "fab fa-discord" },
    { label: "Youtube", target:'_blank', href: "https://www.youtube.com/channel/UCuChIjgg-T3q1V6sPpPApdQ", iconClass: "fab fa-youtube" },
  ];
  
  // DİKKAT: Projeler sayfanızın yolu /projeler/[slug] şeklinde. 
  // Oyunlar ve Animeler için ayrı yollarınız varsa (/oyunlar/[slug]) bu doğrudur.
  // Eğer tek bir proje yolu varsa, href'i `/projeler/${link.slug}` olarak değiştirmelisiniz.
  // Şimdilik dosya yapınıza göre bu şekilde bırakıyorum.
  const getProjectHref = (type: string, slug: string) => {
    // Proje detay sayfanızın yolu `/projeler/[slug]` olduğu için bu şekilde olmalı.
    return `/projeler/${slug}`;
  };

  return (
    <footer id="mainFooter" className="bg-footer-bg text-footer-text text-sm pt-10">
      <div className="footer-top-bar border-b border-footer-border pb-6 mb-8">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-block">
            <h2 className="footer-main-title text-xl sm:text-2xl font-semibold text-footer-main-title-text hover:opacity-80 transition-opacity">
              PrestiJ STUDIO
            </h2>
          </Link>
        </div>
      </div>
      <div className="container mx-auto footer-content-container px-4 flex flex-wrap justify-between gap-x-6 gap-y-8 pb-10">
        <div className="footer-logo-column flex-shrink-0 w-full sm:w-auto mb-6 sm:mb-0 flex justify-center sm:justify-start">
          <Link href="/" className="inline-block">
            <Image 
              src="/images/logo-placeholder.png"
              alt="PrestiJ Logo" 
              width={120} 
              height={120}
              className="footer-logo-img w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] object-contain"
            />
          </Link>
        </div>
        <div className="footer-links-column flex-1 min-w-[150px] xs:min-w-[170px] sm:min-w-[180px]">
          <h4 className="footer-column-title text-sm font-semibold text-footer-column-title-text mb-4 uppercase tracking-wider">OYUNLAR</h4>
          {isLoading ? (
            <ul className="space-y-2.5">
              {[...Array(3)].map((_, i) => <li key={i} className="h-4 bg-gray-700/50 rounded animate-pulse w-3/4"></li>)}
            </ul>
          ) : gameLinks.length > 0 ? (
            <ul className="space-y-2.5">
              {gameLinks.map(link => (
                <li key={link.slug}>
                  <Link 
                    href={getProjectHref(link.type, link.slug)} // Dinamik URL
                    className="text-footer-link-text hover:text-footer-link-hover-text hover:underline transition-colors text-xs sm:text-sm"
                    title={link.title}
                  >
                    {link.title.length > 25 ? `${link.title.substring(0, 25)}...` : link.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500">Henüz oyun yok.</p>
          )}
        </div>
        <div className="footer-links-column flex-1 min-w-[150px] xs:min-w-[170px] sm:min-w-[180px]">
          <h4 className="footer-column-title text-sm font-semibold text-footer-column-title-text mb-4 uppercase tracking-wider">ANİMELER</h4>
          {isLoading ? (
             <ul className="space-y-2.5">
             {[...Array(3)].map((_, i) => <li key={i} className="h-4 bg-gray-700/50 rounded animate-pulse w-3/4"></li>)}
           </ul>
          ) : animeLinks.length > 0 ? (
            <ul className="space-y-2.5">
              {animeLinks.map(link => (
                <li key={link.slug}>
                  <Link 
                    href={getProjectHref(link.type, link.slug)} // Dinamik URL
                    className="text-footer-link-text hover:text-footer-link-hover-text hover:underline transition-colors text-xs sm:text-sm"
                    title={link.title}
                  >
                     {link.title.length > 25 ? `${link.title.substring(0, 25)}...` : link.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500">Henüz anime yok.</p>
          )}
        </div>
        <div className="footer-links-column flex-1 min-w-[150px] xs:min-w-[170px] sm:min-w-[180px]">
          <h4 className="footer-column-title text-sm font-semibold text-footer-column-title-text mb-4 uppercase tracking-wider">HAKKIMIZDA</h4>
          <ul className="space-y-2.5">
            {aboutLinks.map(link => (
              <li key={link.label}>
                <Link href={link.href} className="text-footer-link-text hover:text-footer-link-hover-text hover:underline transition-colors text-xs sm:text-sm">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-contact-column flex-1 min-w-[200px] xs:min-w-[220px]">
          <h4 className="footer-column-title text-sm font-semibold text-footer-column-title-text mb-4 uppercase tracking-wider">İLETİŞİM</h4>
          <div>
            <p className="contact-label text-footer-contact-label-text text-xs mb-2">Sosyal Medya</p>
            <div className="social-icons-footer flex items-center gap-3.5 mb-4">
              {socialLinks.map(social => (
                <Link key={social.label} href={social.href} aria-label={social.label} target="_blank" rel="noopener noreferrer"
                   className="text-footer-social-icon hover:text-footer-social-icon-hover hover:scale-110 transition-all text-lg">
                  <i className={social.iconClass}></i>
                </Link>
              ))}
            </div>
            <p className="contact-label text-footer-contact-label-text text-xs mb-1 mt-4">E-Mail</p>
            <a href="mailto:iletisim@prestijstudio.com" className="email-link text-footer-link-text hover:text-footer-link-hover-text hover:underline font-medium transition-colors break-all text-xs sm:text-sm">
              iletisim@prestijstudio.com
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom-bar border-t border-footer-border py-5 text-xs text-footer-bottom-bar-text">
        <div className="container mx-auto footer-bottom-content px-4 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <div className="copyright-text-wrapper text-center sm:text-left">
            <p className="copyright-text">© {year} PrestiJ Studio Tüm Hakları Saklıdır.</p>
          </div>
          <div className="developer-credit text-center">
            <p>
              <Link href="https://guns.lol/chimiya" target="_blank" rel="noopener noreferrer" className="chimiya-link text-footer-chimiya-link hover:text-footer-chimiya-link-hover hover:border-b hover:border-footer-chimiya-link-hover transition-colors">
                Chimiya
              </Link> tarafından geliştirildi
            </p>
          </div>
          <div className="footer-legal-nav-wrapper text-center sm:text-right">
            <nav className="footer-legal-nav">
              <Link href="/kullanim-kosullari" className="hover:text-white hover:underline transition-colors">Kullanım Koşulları</Link>
              <span className="mx-1.5 sm:mx-2">|</span>
              <Link href="/gizlilik-politikasi" className="hover:text-white hover:underline transition-colors">Gizlilik Politikası</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;