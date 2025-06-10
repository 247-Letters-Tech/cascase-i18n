import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupportedLanguage, SupportedPersona, SupportedMode, SupportedUserType, i18n, LanguageManifest } from '../services/i18nService';

interface I18nContextType {
  language: SupportedLanguage;
  persona: SupportedPersona;
  mode: SupportedMode;
  userType: SupportedUserType;
  isLoading: boolean;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  setPersona: (persona: SupportedPersona) => Promise<void>;
  setMode: (mode: SupportedMode) => Promise<void>;
  availableLanguages: SupportedLanguage[];
  availablePersonas: SupportedPersona[];
  availableModes: SupportedMode[];
}

const defaultContext: I18nContextType = {
  language: 'en',
  persona: 'default',
  mode: 'default',
  userType: 'default',
  isLoading: true,
  setLanguage: async () => {},
  setPersona: async () => {},
  setMode: async () => {},
  availableLanguages: ['en'],
  availablePersonas: ['default'],
  availableModes: ['default'],
};

const I18nContext = createContext<I18nContextType>(defaultContext);

interface I18nProviderProps {
  children: ReactNode;
  supabase: SupabaseClient;
  initialLanguage?: SupportedLanguage;
  initialPersona?: SupportedPersona;
  initialMode?: SupportedMode;
  userType?: SupportedUserType;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  supabase,
  initialLanguage = 'en',
  initialPersona = 'default',
  initialMode = 'default',
  userType = 'default'
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(initialLanguage);
  const [persona, setPersonaState] = useState<SupportedPersona>(initialPersona);
  const [mode, setModeState] = useState<SupportedMode>(initialMode);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for available options - initialized empty
  const [availableLanguages, setAvailableLanguages] = useState<SupportedLanguage[]>([]);
  const [availablePersonas, setAvailablePersonas] = useState<SupportedPersona[]>([]);
  const [availableModes, setAvailableModes] = useState<SupportedMode[]>([]);

  // Initialize i18n and derive available options from manifest
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        // Initialize i18n service (loads manifest)
        await i18n.init(supabase);
        
        // Get the loaded manifest
        const manifest = i18n.getManifest();
        let derivedLanguages: SupportedLanguage[] = [];
        let derivedPersonas: SupportedPersona[] = [];
        let derivedModes: SupportedMode[] = [];

        if (manifest) {
          // Derive available options from the manifest
          derivedLanguages = Object.keys(manifest) as SupportedLanguage[];
          setAvailableLanguages(derivedLanguages);

          // Aggregate unique personas
          const firstLang = derivedLanguages[0];
          const personasSet = new Set<SupportedPersona>();
          if (firstLang && manifest[firstLang]) {
            const langManifest: LanguageManifest = manifest[firstLang];
            Object.keys(langManifest).forEach(key => {
              if (key !== '_tones') {
                const modulePersonas = langManifest[key];
                if (Array.isArray(modulePersonas)) {
                  modulePersonas.forEach(p => personasSet.add(p as SupportedPersona));
                }
              }
            });
            derivedPersonas = Array.from(personasSet);
            setAvailablePersonas(derivedPersonas);

            // Get available modes
            derivedModes = langManifest._tones 
              ? Object.keys(langManifest._tones) as SupportedMode[] 
              : [];
            setAvailableModes(derivedModes);
          }
          
          // Load saved preferences and determine initial state
          const savedLanguage = localStorage.getItem('i18n_language') as SupportedLanguage | null;
          const savedPersona = localStorage.getItem('i18n_persona') as SupportedPersona | null;
          const savedMode = localStorage.getItem('i18n_mode') as SupportedMode | null;

          const currentLang = savedLanguage && derivedLanguages.includes(savedLanguage) ? savedLanguage : (derivedLanguages[0] || initialLanguage);
          const currentPersona = savedPersona && derivedPersonas.includes(savedPersona) ? savedPersona : initialPersona;
          const currentMode = savedMode && derivedModes.includes(savedMode) ? savedMode : initialMode;
          const currentUserType = userType;

          setLanguageState(currentLang);
          setPersonaState(currentPersona);
          setModeState(currentMode);

          // Set initial language context in the service *after* determining the correct initial state
          await i18n.setLanguageContext(currentLang, currentPersona, currentMode, currentUserType);

        } else {
          console.warn("i18n manifest not loaded, using default options.");
          // Fallback to defaults if manifest fails
          derivedLanguages = ['en'];
          derivedPersonas = ['default', 'student', 'professional'];
          derivedModes = ['default', 'zen', 'roast', 'bro'];
          setAvailableLanguages(derivedLanguages);
          setAvailablePersonas(derivedPersonas);
          setAvailableModes(derivedModes);

          // Set initial state and service context with defaults
          setLanguageState(initialLanguage);
          setPersonaState(initialPersona);
          setModeState(initialMode);
          await i18n.setLanguageContext(initialLanguage, initialPersona, initialMode, 'default');
        }

      } catch (error) {
        console.error('Failed to initialize i18n context:', error);
         // Fallback to defaults on error
        setAvailableLanguages(['en']);
        setAvailablePersonas(['default', 'student', 'professional']);
        setAvailableModes(['default', 'zen', 'roast', 'bro']);
        setLanguageState(initialLanguage);
        setPersonaState(initialPersona);
        setModeState(initialMode);
        // Attempt to set service context even on error, maybe it partially loaded
        try { await i18n.setLanguageContext(initialLanguage, initialPersona, initialMode, 'default'); } catch {} 
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Rerun when auth loading finishes

  // Update i18n service when language, persona, mode, OR userType changes
  useEffect(() => {
    // Skip the effect during initial loading or if the service isn't ready
    if (isLoading || !i18n.isInitialized) return;
    
    const updateContext = async () => {
      try {
        // Pass userType to the service
        await i18n.setLanguageContext(language, persona, mode, userType);
        
        // Save preferences to localStorage
        localStorage.setItem('i18n_language', language);
        localStorage.setItem('i18n_persona', persona);
        localStorage.setItem('i18n_mode', mode);
      } catch (error) {
        console.error('Failed to update i18n context:', error);
      }
    };
    
    updateContext();
  }, [language, persona, mode, userType, isLoading]); // Add userType to dependency array

  const setLanguage = async (newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage);
  };

  const setPersona = async (newPersona: SupportedPersona) => {
    setPersonaState(newPersona);
  };

  const setMode = async (newMode: SupportedMode) => {
    setModeState(newMode);
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        persona,
        mode,
        userType,
        isLoading,
        setLanguage,
        setPersona,
        setMode,
        availableLanguages,
        availablePersonas,
        availableModes,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18nContext = () => useContext(I18nContext);

export default I18nContext; 