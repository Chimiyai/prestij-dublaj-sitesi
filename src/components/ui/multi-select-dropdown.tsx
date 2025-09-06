// src/components/ui/multi-select-dropdown.tsx
'use client';

import { Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { cn } from '@/lib/utils';

interface MultiSelectDropdownProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = 'Seçim yapın...'
}: MultiSelectDropdownProps) {
  
  return (
    <Combobox value={selected} onChange={onChange} multiple>
      <div className="relative">
        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-[#110E1B] text-left border border-[#37304F] focus-within:border-[#8166FF] focus-within:ring-2 focus-within:ring-indigo-500/50">
          <Combobox.Button as="div" className="w-full">
            <div className="flex flex-wrap gap-2 p-2 min-h-[42px] items-center">
              {selected.length === 0 && <span className="px-1 text-gray-500">{placeholder}</span>}
              {selected.map((option) => (
                <span
                  key={option}
                  className="flex items-center gap-1.5 rounded-md bg-indigo-500/20 px-2 py-1 text-sm text-indigo-300"
                >
                  {option}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // Butonun combobox'ı açmasını/kapatmasını engelle
                      onChange(selected.filter((item) => item !== option));
                    }}
                    className="text-indigo-400 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" /></svg>
                  </button>
                </span>
              ))}
            </div>
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </Combobox.Button>
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#181522] py-1 text-base shadow-lg ring-1 ring-black/5 ring-gray-700 focus:outline-none sm:text-sm z-10">
            {options.length === 0 ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-500">
                Seçenek yok.
              </div>
            ) : (
              options.map((option) => (
                <Combobox.Option
                  key={option}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-indigo-600/30 text-white' : 'text-gray-300'
                    }`
                  }
                  value={option}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {option}
                      </span>
                      {selected ? (
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-indigo-400'}`}>
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}