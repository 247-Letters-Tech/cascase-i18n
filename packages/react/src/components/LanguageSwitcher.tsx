import React from 'react';
import { useI18nContext } from '../contexts/I18nContext';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger
// } from '@/components/ui/navigation';
// import { Button } from '@/components/ui/input-controls';
import { Globe, User, Palette } from 'lucide-react';
import { SupportedLanguage, SupportedPersona, SupportedMode } from '@cascade-i18n/core';

// Helper function to get language display name
const getLanguageDisplay = (code: SupportedLanguage): string => {
  const languages = {
    'en': 'English',
    'ta': 'Tamil',
    'ta-tg': 'Tanglish'
  };
  return languages[code] || code;
};

// Helper function to get persona display name
const getPersonaDisplay = (persona: SupportedPersona): string => {
  const personas = {
    'default': 'Default',
    'student': 'Student',
    'professional': 'Professional'
  };
  return personas[persona] || persona;
};

// Helper function to get mode display name
const getModeDisplay = (mode: SupportedMode): string => {
  const modes = {
    'default': 'Default',
    'zen': 'Zen',
    'roast': 'Roast',
    'bro': 'Bro'
  };
  return modes[mode] || mode;
};

export const LanguageSwitcher: React.FC = () => {
  const {
    language,
    persona,
    mode,
    setLanguage,
    setPersona,
    setMode,
    availableLanguages,
    availablePersonas,
    availableModes,
    isLoading
  } = useI18nContext();

  return (
    <div>
      <div>
        <button>
          <Globe className="h-4 w-4" />
          <span>{getLanguageDisplay(language)}</span>
        </button>
      </div>
      <div>
        <div>Language</div>
        {availableLanguages.map((lang) => (
          <div
            key={`lang-${lang}`}
            onClick={() => setLanguage(lang)}
            className={language === lang ? "bg-accent" : ""}
          >
            {getLanguageDisplay(lang)}
          </div>
        ))}

        <hr />

        <div>
          <User className="h-4 w-4" />
          Persona
        </div>
        {availablePersonas.map((p) => (
          <div
            key={`persona-${p}`}
            onClick={() => setPersona(p)}
            className={persona === p ? "bg-accent" : ""}
          >
            {getPersonaDisplay(p)}
          </div>
        ))}

        <hr />

        <div>
          <Palette className="h-4 w-4" />
          Tone
        </div>
        {availableModes.map((m) => (
          <div
            key={`mode-${m}`}
            onClick={() => setMode(m)}
            className={mode === m ? "bg-accent" : ""}
          >
            {getModeDisplay(m)}
          </div>
        ))}
      </div>
    </div>
  );
}; 