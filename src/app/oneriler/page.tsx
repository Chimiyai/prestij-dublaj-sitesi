// src/app/oneriler/page.tsx

import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { VoteButton } from './_components/VoteButton'; // Oy verme butonu (Client Component)
import { AddSuggestionButton } from './_components/AddSuggestionButton'; // Yeni öneri ekleme butonu (Client Component)

export const metadata: Metadata = {
  title: 'Topluluk Önerileri | PrestiJ',
  description: 'Sıradaki projemizi belirlememize yardımcı olun! İstediğiniz oyunlar için oy verin veya yeni bir öneride bulunun.',
};

export const revalidate = 60; // Sayfayı 60 saniyede bir yeniden doğrula (yeni oyları göstermek için)

// Veritabanından önerileri ve oy sayılarını çeken fonksiyon
async function getCommunitySuggestions() {
  const suggestions = await prisma.communitySuggestion.findMany({
    where: {
      status: 'ACTIVE', // Sadece aktif önerileri göster
    },
    select: {
      id: true,
      gameTitle: true,
      steamUrl: true,
      _count: { // İlişkili oyları say
        select: { votes: true },
      },
    },
    orderBy: {
      votes: {
        _count: 'desc', // En çok oy alana göre sırala
      },
    },
    take: 50, // Performans için ilk 50'yi al
  });
  return suggestions;
}

export default async function CommunitySuggestionsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? parseInt(session.user.id) : null;
  
  // Hem önerileri hem de mevcut kullanıcının oylarını tek seferde çekelim
  const [suggestions, userVotes] = await Promise.all([
    getCommunitySuggestions(),
    userId ? prisma.communitySuggestionVote.findMany({
      where: { userId: userId },
      select: { suggestionId: true }
    }) : Promise.resolve([])
  ]);

  const userVotedSuggestionIds = new Set(userVotes.map(vote => vote.suggestionId));

  return (
    <div style={{ backgroundColor: '#08060D' }} className="text-white min-h-screen">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
            Topluluk Önerileri
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            En çok istenen oyunları gör, kendi favorine oy ver veya listeye yeni bir oyun ekle.
            Sıradaki projemizi birlikte belirleyelim!
          </p>
        </div>

        {/* Yeni Öneri Ekleme Butonu ve Formu */}
        <div className="mb-12 flex justify-center">
            <AddSuggestionButton isUserLoggedIn={!!session} />
        </div>

        {/* Öneri Listesi */}
        <div className="max-w-4xl mx-auto">
          <ul className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <li 
                key={suggestion.id}
                className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex items-center justify-between gap-4 transition-all hover:border-indigo-500/50"
              >
                <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-600 w-10 text-center">{index + 1}</span>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{suggestion.gameTitle}</h3>
                        {suggestion.steamUrl && (
                            <a href={suggestion.steamUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                                Steam Sayfası
                            </a>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <p className="text-xl font-bold text-white">{suggestion._count.votes}</p>
                        <p className="text-xs text-gray-500">İstek</p>
                    </div>
                    {/* Oy Verme Butonu (Client Component) */}
                    <VoteButton 
                        suggestionId={suggestion.id}
                        initialVoteCount={suggestion._count.votes}
                        isUserLoggedIn={!!session}
                        hasVoted={userVotedSuggestionIds.has(suggestion.id)}
                    />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}