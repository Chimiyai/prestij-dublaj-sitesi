// src/app/oneriler/_components/VoteButton.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoteButtonProps {
  suggestionId: number;
  initialVoteCount: number;
  isUserLoggedIn: boolean;
  hasVoted: boolean;
}

export function VoteButton({ suggestionId, initialVoteCount, isUserLoggedIn, hasVoted }: VoteButtonProps) {
  const [voted, setVoted] = useState(hasVoted);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleVote = async () => {
    if (!isUserLoggedIn) {
      toast.error('Oy vermek için giriş yapmalısınız.');
      return;
    }
    if (voted || isPending) return;

    startTransition(async () => {
      try {
        // Bu API rotasını birazdan oluşturacağız
        const response = await fetch(`/api/suggestions/community/${suggestionId}/vote`, {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Oy verilemedi.');
        }

        // Optimistic UI Update: API'den beklemeden arayüzü güncelle
        setVoted(true);
        setVoteCount(prev => prev + 1);
        toast.success('İsteğiniz alındı, teşekkürler!');
        
        // Veriyi sunucudan yeniden çekmek yerine,
        // router.refresh() ile mevcut veriyi güncel tutabiliriz.
        // Ama anlık artış daha iyi bir deneyim sunar.

      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  };

  return (
    <button
      onClick={handleVote}
      disabled={voted || isPending || !isUserLoggedIn}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors disabled:cursor-not-allowed w-32 justify-center",
        voted 
          ? "bg-indigo-600 text-white" 
          : "bg-gray-800 text-gray-300 hover:bg-indigo-500/50",
        isPending && "opacity-70"
      )}
    >
      <ThumbsUp className="w-4 h-4" />
      <span>{voted ? 'İstedin' : 'İste'}</span>
    </button>
  );
}