import React from 'react';
import { useI18nContext } from '../contexts/I18nContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/navigation';
import { Button } from '@/components/ui/input-controls';
import { Globe, User, Palette } from 'lucide-react';
import { SupportedLanguage, SupportedPersona, SupportedMode } from '../services/i18nService';

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span>{getLanguageDisplay(language)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={`lang-${lang}`}
            onClick={() => setLanguage(lang)}
            className={language === lang ? "bg-accent" : ""}
          >
            {getLanguageDisplay(lang)}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Persona
        </DropdownMenuLabel>
        {availablePersonas.map((p) => (
          <DropdownMenuItem
            key={`persona-${p}`}
            onClick={() => setPersona(p)}
            className={persona === p ? "bg-accent" : ""}
          >
            {getPersonaDisplay(p)}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Tone
        </DropdownMenuLabel>
        {availableModes.map((m) => (
          <DropdownMenuItem
            key={`mode-${m}`}
            onClick={() => setMode(m)}
            className={mode === m ? "bg-accent" : ""}
          >
            {getModeDisplay(m)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 