// src/app/kadromuz/page.tsx

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getCloudinaryImageUrlOptimized } from '@/lib/cloudinary';
import { FaTwitter, FaInstagram, FaYoutube, FaGlobe, FaLinkedin, FaGithub } from 'react-icons/fa';
import { HeartIcon as DonationIconOutline } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kadromuz | PrestiJ Ekibi',
  description: 'PrestiJ projelerine hayat veren yetenekli seslendirme sanatçıları, çevirmenler ve tüm değerli ekip üyelerimizle tanışın.',
  openGraph: {
    title: 'Kadromuz | PrestiJ Ekibi',
    description: 'Projelerimize hayat veren yetenekli kadromuzla tanışın.',
    url: 'https://www.prestijstudio.com/kadromuz',
    siteName: 'PrestiJ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kadromuz | PrestiJ Ekibi',
    description: 'Projelerimize hayat veren yetenekli kadromuzla tanışın.',
  }
};

// Tipler aynı kalabilir, sadece sorguyu düzelteceğiz.
export interface TeamMemberForPage {
  id: number;
  firstName: string;
  lastName: string;
  slug: string | null;
  bio: string | null;
  imagePublicId: string | null;
  siteRole: string | null;
  websiteUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  donationLink: string | null;
}

const socialPlatforms = [
    { key: 'websiteUrl', icon: FaGlobe, hoverColor: 'hover:text-green-400', title: 'Website' },
    { key: 'twitterUrl', icon: FaTwitter, hoverColor: 'hover:text-blue-400', title: 'Twitter' },
    { key: 'instagramUrl', icon: FaInstagram, hoverColor: 'hover:text-pink-400', title: 'Instagram' },
    { key: 'youtubeUrl', icon: FaYoutube, hoverColor: 'hover:text-red-500', title: 'YouTube' },
    { key: 'linkedinUrl', icon: FaLinkedin, hoverColor: 'hover:text-blue-500', title: 'LinkedIn' },
    { key: 'githubUrl', icon: FaGithub, hoverColor: 'hover:text-gray-300', title: 'GitHub' },
] as const; // as const daha sıkı tip kontrolü sağlar


async function getTeamMembers(): Promise<TeamMemberForPage[]> {
  return prisma.dubbingArtist.findMany({
    where: { isTeamMember: true },
    // <<< DÜZELTME 1: SIRALAMA MANTIĞI GÜNCELLENDİ <<<
    // teamOrder'ı null olanları en sona atacak şekilde sırala.
    orderBy: [
      { teamOrder: { sort: 'asc', nulls: 'last' } },
      { firstName: 'asc' }
    ],
    // <<< DÜZELTME 2: EKSİK OLABİLECEK ALANLARIN SEÇİLDİĞİNDEN EMİN OL <<<
    // donationLink ve teamOrder'ın seçildiğini tekrar kontrol edelim.
    select: {
        id: true,
        firstName: true,
        lastName: true,
        slug: true,
        bio: true,
        imagePublicId: true,
        siteRole: true,
        websiteUrl: true,
        twitterUrl: true,
        instagramUrl: true,
        youtubeUrl: true,
        linkedinUrl: true,
        githubUrl: true,
        donationLink: true,
    }
  });
}

export default async function KadromuzPage() {
  const teamMembers = await getTeamMembers();

  return (
    <div style={{ backgroundColor: '#08060D' }} className="text-white min-h-screen py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 md:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
            Ekibimizle Tanışın
          </h1>
          <p className="mt-5 text-lg leading-8 text-gray-400 max-w-2xl mx-auto">
            PrestiJ'in projelerine hayat veren, tutkulu ve deneyimli kadromuz.
          </p>
        </div>

        {teamMembers.length === 0 ? (
          <p className="text-center text-xl text-gray-500 py-10">Kadromuz güncelleniyor...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {teamMembers.map((member) => {
              const memberProfileLink = `/sanatcilar/${member.id}`;
              const avatarUrl = getCloudinaryImageUrlOptimized(member.imagePublicId, { width: 128, height: 128, crop: 'fill', gravity: 'face' }, 'avatar');
              const activeSocialLinks = socialPlatforms.filter(p => member[p.key]);

              return (
                <div 
                  key={member.id} 
                  className={cn(
                    "group relative flex flex-col p-6 rounded-2xl transition-all duration-300 ease-out overflow-hidden",
                    "bg-gray-900/40 border border-gray-800/80 shadow-2xl",
                    "hover:border-indigo-500/50 hover:shadow-indigo-500/20 hover:-translate-y-1"
                  )}
                >
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* İsim, Avatar, Bio ve Sosyal Medya */}
                  <div className="z-10">
                    <div className="flex flex-col items-center text-center mb-4">
                      <Link href={memberProfileLink} className="block">
                        <div className="w-28 h-28 rounded-full overflow-hidden mb-5 border-2 border-gray-700/80 group-hover:border-indigo-400 transition-all duration-300 transform group-hover:scale-110 relative bg-gray-800">
                          <Image src={avatarUrl || '/images/default-avatar.png'} alt={`${member.firstName} ${member.lastName}`} fill className="object-cover" sizes="128px" />
                        </div>
                      </Link>
                      <h3 className="text-xl font-semibold text-white group-hover:text-indigo-300 transition-colors duration-300">{member.firstName} {member.lastName}</h3>
                      {member.siteRole && (<p className="text-sm font-medium mt-1 text-indigo-400 group-hover:text-sky-300 transition-colors">{member.siteRole}</p>)}
                    </div>
            
                    {member.bio && (<p className="text-sm text-gray-400 leading-relaxed text-center mb-5">"{member.bio}"</p>)} {/* <<< flex-grow KALDIRILDI <<< */}
                  
                    {activeSocialLinks.length > 0 && (
                      <div className="mb-5 pt-4 border-t border-gray-800/60 flex flex-wrap justify-center items-center gap-5">
                        {activeSocialLinks.map((platform) => (<Link key={platform.key} href={member[platform.key]!} target="_blank" rel="noopener noreferrer" className={cn("text-gray-500 transition-colors duration-200", platform.hoverColor)} title={platform.title}><platform.icon size={20} /></Link>))}
                      </div>
                    )}
                  </div>
            
                  {/* <<< DÜZELTME: BOŞ ALANI DOLDURACAK OLAN GÖRÜNMEZ ELEMAN <<< */}
                  <div className="flex-grow" />
            
                  {/* "Destek Ol" Butonu (En altta sabitlenecek) */}
                  {member.donationLink && (
                    <div className="pt-4 z-10">
                      <Link
                        href={member.donationLink} target="_blank" rel="noopener noreferrer"
                        className="w-full flex items-center justify-center px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-500/50 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        <DonationIconOutline className="w-5 h-5 mr-2" />
                        Destek Ol
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}