// src/components/auth/RecoveryCodeModal.tsx
'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { KeyRound, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recoveryCode: string;
}

export default function RecoveryCodeModal({ isOpen, onClose, recoveryCode }: Props) {
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recoveryCode);
    setHasCopied(true);
    toast.success('Kod panoya kopyalandı!');
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* ... (Modal arkaplanı ve paneli için Headless UI kodları) ... */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-prestij-bg-dark-2 p-6 text-left align-middle shadow-xl transition-all border border-prestij-border-primary">
              <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-white flex items-center gap-2">
                <KeyRound className="text-yellow-400" /> Önemli: Kurtarma Kodunuz
              </Dialog.Title>
              <div className="mt-4">
                <p className="text-sm text-prestij-text-muted mb-4">
                  Bu kod, şifrenizi unutmanız durumunda hesabınıza erişebilmenizin TEK YOLUDUR. Lütfen güvenli bir yere kaydedin. Bu pencereyi kapattıktan sonra bu kodu bir daha göremeyeceksiniz!
                </p>
                <div className="p-4 bg-prestij-bg-dark-4 rounded-lg flex items-center justify-between gap-4">
                  <code className="text-lg font-mono text-yellow-400 break-all">{recoveryCode}</code>
                  <button onClick={copyToClipboard} className="p-2 text-gray-400 hover:text-white transition-colors">
                    {hasCopied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-prestij-purple px-4 py-2 text-sm font-medium text-white hover:bg-prestij-purple-darker focus:outline-none"
                  onClick={onClose}
                >
                  Anladım, kaydettim!
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}