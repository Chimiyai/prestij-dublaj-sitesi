// src/components/home/SuggestOptionCard.tsx
"use client";

import { ElementType } from 'react'; // React'ten ElementType'ı import ediyoruz

interface SuggestOptionCardProps {
  title: string;
  description: string;
  buttonText: string;
  Icon?: ElementType; // <-- DEĞİŞİKLİK 1: `buttonIconSrc` yerine `Icon` prop'u
  onButtonClick: () => void;
  isPrimaryAction?: boolean;
}

const SuggestOptionCard: React.FC<SuggestOptionCardProps> = ({
  title,
  description,
  buttonText,
  Icon, // <-- DEĞİŞİKLİK 2: Prop'u alıyoruz
  onButtonClick,
  isPrimaryAction = false,
}) => {
  const buttonBaseClasses = "btn-suggest-action inline-flex items-center gap-2 py-2.5 px-5 text-sm rounded-md mb-3 transition-all duration-200 hover:-translate-y-0.5";
  const primaryButtonClasses = "bg-suggest-btn-primary-bg text-suggest-btn-primary-text border-none hover:bg-suggest-btn-primary-hover-bg";
  const secondaryButtonClasses = "bg-suggest-btn-secondary-bg text-suggest-btn-secondary-text border border-suggest-btn-secondary-border hover:bg-suggest-btn-secondary-hover-bg";

  return (
    <div className="suggest-option-card bg-suggest-card-bg p-6 rounded-lg border border-suggest-card-border shadow-suggest-card text-center flex flex-col items-center">
      <h3 className="suggest-option-title text-xl font-semibold text-suggest-card-title mb-4">
        {title}
      </h3>
      <button
        onClick={onButtonClick}
        className={`${buttonBaseClasses} ${isPrimaryAction ? primaryButtonClasses : secondaryButtonClasses}`}
      >
        {/* --- DEĞİŞİKLİK 3: Image bileşeni yerine doğrudan Icon'u render ediyoruz --- */}
        {Icon && <Icon className="btn-icon w-4 h-4" />}
        {buttonText}
      </button>
      <p className="suggest-option-description text-xs text-suggest-card-description leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default SuggestOptionCard;
