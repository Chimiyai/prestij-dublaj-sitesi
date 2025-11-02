// src/components/profile/EditArtistProfileModal.tsx
'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
// Yeni, temiz formumuzu import ediyoruz
import ArtistProfileEditor from './ArtistProfileEditor'; 
import { DubbingArtist } from '@prisma/client';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface EditArtistProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  artistProfile: DubbingArtist;
}

export default function EditArtistProfileModal({ isOpen, onClose, artistProfile }: EditArtistProfileModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-gray-800 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-white">
                        Sanatçı Profilini Düzenle
                    </Dialog.Title>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
                        <XMarkIcon className="w-6 h-6 text-gray-400" />
                    </button>
                </div>
                
                {/* EditArtistForm'u burada çağırıyoruz */}
                <div className="p-1">
                <ArtistProfileEditor artistProfile={artistProfile} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}