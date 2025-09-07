// src/components/project/VolunteerSection.tsx
'use client';

import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { ContributionModal } from './ContributionModal';
import { UserSession, ContributionCharacter } from '@/types/contributions'; // <<< YENİ İMPORT

interface VolunteerSectionProps {
    projectId: number;
    characters: ContributionCharacter[];
    user: UserSession | null;
}

export function VolunteerSection({ projectId, characters, user }: VolunteerSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<ContributionCharacter | null>(null);

  const openContributionModal = (character: ContributionCharacter) => {
    setSelectedCharacter(character);
    setIsModalOpen(true);
  };

  if (characters.length === 0) {
    return null; // Gönüllü aranan karakter yoksa bölümü hiç gösterme
  }

  return (
    <>
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-indigo-900/50 via-gray-900 to-gray-900 border border-indigo-700/50 rounded-xl p-8 text-center">
          <SparklesIcon className="w-12 h-12 mx-auto text-indigo-400 mb-4" />
          <h2 className="text-3xl font-bold text-white mb-3">Bu Maceranın Bir Parçası Ol!</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Aşağıdaki karakterleri seslendirerek bu projeye doğrudan katkıda bulunabilirsin. Onaylanan katkılar, sanatçı profilinde sergilenecektir!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {characters.map(char => (
              <button
                key={char.id}
                onClick={() => openContributionModal(char)}
                className="bg-gray-800 hover:bg-indigo-600 border border-gray-700 hover:border-indigo-500 text-white font-semibold py-2 px-5 rounded-lg transition-colors"
              >
                {char.name} <span className="text-xs text-gray-400">({char.dialogues.length} Diyalog)</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <ContributionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        character={selectedCharacter}
        projectId={projectId}
        user={user} // <<< DEĞİŞİKLİK: isUserLoggedIn yerine user objesinin tamamını gönder
      />
    </>
  );
}