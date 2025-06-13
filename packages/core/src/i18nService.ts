// import { toast } from "sonner";
import { SupabaseClient } from "@supabase/supabase-js";

// Types for our i18n system
/**
 * Defines the supported languages for translation.
 * - `en`: English
 * - `ta`: Tamil
 * - `ta-tg`: Tanglish (Tamil written in English script)
 */
export type SupportedLanguage = "en" | "ta" | "ta-tg";

/**
 * Defines different user personas to tailor content.
 */
export type SupportedPersona = "student" | "professional" | "default";

/**
 * Defines different content modes/tones.
 */
export type SupportedMode = "zen" | "roast" | "bro" | "default";

/**
 * Defines different user subscription types.
 */
export type SupportedUserType = "student" | "pro" | "free" | "default";

/**
 * Defines the available translation modules.
 */
export type ModuleName =
  | "roadmap"
  | "common"
  | "goals"
  | "tasks"
  | "milestones"
  | "accessibility";

// Cache structure
/**
 * @internal
 * Defines the shape of the in-memory translation cache.
 * Structure: [language][module][personaAndMode] -> translations
 */
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

/**
 * Represents the structure of the manifest for a single language.
 */
export type LanguageManifest = Modules & Tones;

/**
 * Represents the top-level structure of the i18n manifest file.
 */
export interface I18nManifest {
  [language: string]: LanguageManifest;
}

/**
 * I18nService is a singleton responsible for managing all internationalization logic.
 * It fetches a manifest file, dynamically loads translation modules based on the
 * current context (language, persona, mode, user type), and provides a method
 * to retrieve translated strings.
 */
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

  private constructor() {}

  /**
   * Gets the singleton instance of the I18nService.
   * @returns The singleton I18nService instance.
   */
  public static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }

  /**
   * Initializes the i18n service by connecting to Supabase and loading the manifest.
   * This method must be called before any other methods.
   * @param supabase - The Supabase client instance.
   * @returns A promise that resolves when the service is initialized.
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
        console.error("Failed to load translation system");
        // Fallback to initialized state anyway to prevent infinite retries
        this.isInitialized = true;
        resolve();
      }
    });

    return this.initPromise;
  }

  /**
   * Retrieves the loaded i18n manifest.
   * @returns The manifest object, or null if not loaded.
   */
  public getManifest(): I18nManifest | null {
    return this.manifest;
  }

  /**
   * @internal
   * Loads the main `manifest.json` from Supabase storage.
   * This file directs how other translation files are loaded.
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
   * Sets the context for translations. This determines which translation
   * files (patches) are loaded and merged.
   * @param language - The target language.
   * @param persona - The user persona.
   * @param mode - The content mode/tone.
   * @param userType - The user's subscription type.
   * @returns A promise that resolves when the context is set.
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
   * Retrieves a translated string for a given key and module.
   * It ensures the required module is loaded, then looks up the key.
   * @param module - The module the key belongs to.
   * @param key - The key of the string to translate (e.g., "greetings.hello").
   * @param defaultValue - A fallback value to return if the key is not found.
   * @returns A promise that resolves to the translated string or the default value.
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
   * @internal
   * Generates a unique cache key based on the current context.
   * This is used to store different merged versions of a module.
   * @param module - The module name.
   * @returns A unique string key for the cache.
   */
  private getCacheKey(module: string): string {
    return `${this.currentUserType}_${this.currentPersona}_${this.currentMode}`;
  }

  /**
   * @internal
   * Loads and merges all relevant translation files for a given module
   * based on the current context (language, userType, persona, mode).
   * The process is as follows:
   * 1. Load the base translation file for the module.
   * 2. Load the patch for the current `userType` and merge it.
   * 3. Load the patch for the current `persona` and merge it.
   * 4. Load the patch for the current `mode` and merge it.
   * The result is then stored in the cache.
   * @param module - The module to load.
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

      console.log(`Finished loading module ${module}`);
    } catch (error) {
      console.error(`Failed to load module ${module}:`, error);
      // Don't throw, just log the error and continue
    }
  }

  /**
   * @internal
   * Fetches a single JSON translation file from Supabase storage.
   * @param language - The language folder (e.g., "en", "ta").
   * @param filePath - The name of the file to fetch (e.g., "common" or "common_pro").
   * @returns A promise that resolves to the parsed JSON object.
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
   * @internal
   * Deeply merges two objects. This is used to combine the base
   * translation file with various patches.
   * @param target - The base object.
   * @param source - The object with patches to apply.
   * @returns A new object with the source merged into the target.
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

/**
 * @internal
 * Utility function to check if an item is a non-null object.
 * @param item - The item to check.
 * @returns True if the item is an object, false otherwise.
 */
function isObject(item: any): boolean {
  return item && typeof item === "object" && !Array.isArray(item);
}

export const i18n = I18nService.getInstance();
