// src/components/ui/WaveformPlayer.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

// Wavesurfer.js'in görünüm ayarları
const options = {
  progressColor: '#8B4EFF', // prestij-purple
  waveColor: '#4C4859',
  cursorColor: '#E0E0E0',
  barWidth: 3,
  barRadius: 3,
  responsive: true,
  height: 60,
  normalize: true,
};

interface WaveformPlayerProps {
  audioUrl: string;
  className?: string;
}

export function WaveformPlayer({ audioUrl, className }: WaveformPlayerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState('0:00');
  const [currentTime, setCurrentTime] = useState('0:00');
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!waveformRef.current) return;

    // Her yeni URL için eski wavesurfer instance'ını yok et
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
    }
    
    // Yeni wavesurfer instance'ı oluştur
    wavesurfer.current = WaveSurfer.create({
      ...options,
      container: waveformRef.current,
      url: audioUrl,
    });
    
    setIsLoading(true);

    // Olay dinleyicilerini (event listeners) ayarla
    wavesurfer.current.on('ready', (totalDuration) => {
      setDuration(formatTime(totalDuration));
      setIsLoading(false);
    });
    
    wavesurfer.current.on('play', () => setIsPlaying(true));
    wavesurfer.current.on('pause', () => setIsPlaying(false));
    wavesurfer.current.on('finish', () => setIsPlaying(false));
    wavesurfer.current.on('audioprocess', (time) => {
        setCurrentTime(formatTime(time));
    });

    // Component unmount olduğunda (sayfadan ayrıldığında) instance'ı temizle
    return () => {
      wavesurfer.current?.destroy();
    };
  }, [audioUrl]);

  const handlePlayPause = useCallback(() => {
    wavesurfer.current?.playPause();
  }, []);

  return (
    <div className={cn("flex items-center gap-3 w-full p-2 bg-gray-800/50 border border-gray-700 rounded-lg", className)}>
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-prestij-purple rounded-full text-white hover:bg-prestij-purple-darker disabled:opacity-50 disabled:cursor-wait"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
        ) : isPlaying ? (
          <PauseIcon className="w-5 h-5" />
        ) : (
          <PlayIcon className="w-5 h-5" />
        )}
      </button>

      <div ref={waveformRef} className="flex-grow h-[60px]"></div>

      <div className="text-xs text-gray-400 font-mono w-20 text-center">
          <span>{currentTime}</span> / <span>{duration}</span>
      </div>
    </div>
  );
}