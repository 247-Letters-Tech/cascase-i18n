import { toast } from "sonner";
import { SupabaseClient } from "@supabase/supabase-js";

// Types for our i18n system
export type SupportedLanguage = "en" | "ta" | "ta-tg";
export type SupportedPersona = "student" | "professional" | "default";
export type SupportedMode = "zen" | "roast" | "bro" | "default";
export type SupportedUserType = "student" | "pro" | "free" | "default";
export type ModuleName =
  | "roadmap"
  | "common"
  | "goals"
  | "tasks"
  | "milestones"
  | "accessibility";

// Cache structure
interface TranslationCache {
  [language: string]: {
    [module: string]: {
      [personaAndMode: string]: Record<string, any>;
    };
  };
}

// Manifest type with proper nested structure
type Modules = {
  [module: string]: string[] | string | { [mode: string]: string[] };
};
type Tones = { _tones?: { [mode: string]: string[] } };

export type LanguageManifest = Modules & Tones;

export interface I18nManifest {
  [language: string]: LanguageManifest;
}

class I18nService {
  manifest: I18nManifest | null = null;
  cache: TranslationCache = {};
  currentLanguage: SupportedLanguage = "en";
  currentPersona: SupportedPersona = "default";
  currentMode: SupportedMode = "default";
  currentUserType: SupportedUserType = "default";
  loadedModules: Set<string> = new Set();
  isInitialized = false;
  initPromise: Promise<void> | null = null;
  private supabase: SupabaseClient | null = null;

  // Singleton pattern
  private static instance: I18nService;

  constructor() {}

  public static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }

  /**
   * Initialize the i18n service by loading the manifest
   */
  public init(supabase: SupabaseClient): Promise<void> {
    if (this.isInitialized) return Promise.resolve();
    this.supabase = supabase;

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise<void>(async (resolve) => {
      try {
        console.log("Initializing i18n service...");
        await this.loadManifest();
        this.isInitialized = true;
        console.log("i18n service initialized");
        resolve();
      } catch (error) {
        console.error("Failed to initialize i18n service:", error);
        toast.error("Failed to load translation system");
        // Fallback to initialized state anyway to prevent infinite retries
        this.isInitialized = true;
        resolve();
      }
    });

    return this.initPromise;
  }

  /**
   * Get the loaded manifest data
   */
  public getManifest(): I18nManifest | null {
    return this.manifest;
  }

  /**
   * Load the manifest file from Supabase Storage
   */
  private async loadManifest(): Promise<void> {
    if (!this.supabase) {
      throw new Error("Supabase client not initialized.");
    }
    try {
      const { data, error } = await this.supabase.storage
        .from("i18n")
        .download("manifest.json");

      if (error) {
        throw new Error(`Failed to load i18n manifest: ${error.message}`);
      }

      if (!data) {
        throw new Error("No manifest data received");
      }

      const text = await data.text();
      this.manifest = JSON.parse(text);
      console.log("Loaded i18n manifest:", this.manifest);
    } catch (error) {
      console.error("Error loading manifest:", error);
      throw error;
    }
  }

  /**
   * Set the current language, persona, and mode
   */
  public async setLanguageContext(
    language: SupportedLanguage,
    persona: SupportedPersona = "default",
    mode: SupportedMode = "default",
    userType: SupportedUserType = "default"
  ): Promise<void> {
    if (!this.isInitialized || !this.initPromise) {
      console.warn(
        "setLanguageContext called before init. This should not happen."
      );
      await this.init(this.supabase!);
    }

    await this.initPromise;

    const needsRefresh =
      this.currentLanguage !== language ||
      this.currentPersona !== persona ||
      this.currentMode !== mode ||
      this.currentUserType !== userType;

    this.currentLanguage = language;
    this.currentPersona = persona;
    this.currentMode = mode;
    this.currentUserType = userType;

    if (needsRefresh) {
      // Clear previously loaded modules so they'll be reloaded with new context
      this.loadedModules.clear();
    }
  }

  /**
   * Get a translation key for a specific module
   */
  public async t(
    module: ModuleName,
    key: string,
    defaultValue: string = key
  ): Promise<string> {
    if (!this.isInitialized || !this.initPromise) {
      console.warn("t called before init. This should not happen.");
      await this.init(this.supabase!);
    }

    await this.initPromise;

    // Ensure module is loaded
    if (!this.loadedModules.has(module)) {
      await this.loadModule(module);
    }

    const cacheKey = this.getCacheKey(module);

    try {
      // Navigate through nested keys using dot notation (e.g. "goals.create.title")
      const keyParts = key.split(".");
      let result = this.cache[this.currentLanguage]?.[module]?.[cacheKey] || {};

      for (const part of keyParts) {
        if (result && typeof result === "object" && part in result) {
          result = result[part];
        } else {
          return defaultValue;
        }
      }

      return typeof result === "string" ? result : defaultValue;
    } catch (error) {
      console.warn(`Translation error for ${module}.${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Get a unique cache key for the current persona and mode
   */
  private getCacheKey(module: string): string {
    return `${this.currentUserType}_${this.currentPersona}_${this.currentMode}`;
  }

  /**
   * Load a specific module's translations
   */
  private async loadModule(module: ModuleName): Promise<void> {
    if (!this.manifest) {
      throw new Error("Manifest not loaded");
    }

    const language = this.currentLanguage;
    const persona = this.currentPersona;
    const mode = this.currentMode;
    const userType = this.currentUserType;

    console.log(
      `Loading module ${module} for ${language} (user: ${userType}, persona: ${persona}, mode: ${mode})`
    );

    // Initialize cache structure if needed
    if (!this.cache[language]) {
      this.cache[language] = {};
    }
    if (!this.cache[language][module]) {
      this.cache[language][module] = {};
    }

    const cacheKey = this.getCacheKey(module);

    try {
      // 1. Load base file
      const baseTranslations = await this.fetchTranslationFile(
        language,
        module
      );

      // Start with base translations
      let mergedTranslations = { ...baseTranslations };

      // 2. Load and merge userType patch if it exists and is not default
      if (userType !== "default") {
        const userTypeTranslations = await this.fetchTranslationFile(
          language,
          `${module}_userType_${userType}`
        );
        mergedTranslations = this.deepMerge(
          mergedTranslations,
          userTypeTranslations
        );
      }

      // 3. Load and merge persona patch if it exists and is not default
      const langManifest = this.manifest[language];
      if (persona !== "default" && langManifest?.[module]) {
        const moduleData = langManifest[module];
        if (Array.isArray(moduleData) && moduleData.includes(persona)) {
          const personaTranslations = await this.fetchTranslationFile(
            language,
            `${module}_${persona}`
          );
          mergedTranslations = this.deepMerge(
            mergedTranslations,
            personaTranslations
          );
        }
      }

      // 4. Load and merge mode patch if it exists and is not default
      if (mode !== "default" && langManifest?._tones?.[mode]) {
        const tonedModules = langManifest._tones[mode];
        if (tonedModules.includes(module)) {
          const modeTranslations = await this.fetchTranslationFile(
            language,
            `${module}_${mode}`
          );
          mergedTranslations = this.deepMerge(
            mergedTranslations,
            modeTranslations
          );
        }
      }

      // 5. Store the final merged translations in the cache
      this.cache[language][module][cacheKey] = mergedTranslations;

      // Mark module as loaded for the current context
      this.loadedModules.add(module);
    } catch (error) {
      console.error(`Failed to load module ${module}:`, error);
      // Don't throw here, t() will handle the missing translation
    }
  }

  /**
   * Fetch a single translation file from Supabase storage
   */
  private async fetchTranslationFile(
    language: string,
    filePath: string
  ): Promise<Record<string, any>> {
    if (!this.supabase) {
      throw new Error("Supabase client not initialized.");
    }
    const fullPath = `${language}/${filePath}.json`;
    console.log(`Fetching translation file: ${fullPath}`);
    try {
      const { data, error } = await this.supabase.storage
        .from("i18n")
        .download(fullPath);

      if (error) {
        // It's common for patch files not to exist, so don't treat as a hard error
        console.warn(
          `Could not load translation file ${fullPath}: ${error.message}`
        );
        return {};
      }

      const text = await data.text();
      return JSON.parse(text);
    } catch (err) {
      console.error(`Error processing translation file ${fullPath}:`, err);
      return {};
    }
  }

  /**
   * Deeply merge two objects
   */
  private deepMerge(
    target: Record<string, any>,
    source: Record<string, any>
  ): Record<string, any> {
    const output = { ...target };

    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }

    return output;
  }
}

function isObject(item: any): boolean {
  return item && typeof item === "object" && !Array.isArray(item);
}

export const i18n = I18nService.getInstance();
