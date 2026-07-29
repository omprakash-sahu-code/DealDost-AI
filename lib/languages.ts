// lib/languages.ts

export type LanguageCode =
  | 'en'
  | 'hinglish'
  | 'hi'
  | 'bn'
  | 'ta'
  | 'te'
  | 'mr'
  | 'gu'
  | 'kn'
  | 'ml'
  | 'pa'
  | 'or'
  | 'ur';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  speechLocale: string; // BCP-47, for the speech-to-text hook
  requiresTranslation: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', speechLocale: 'en-IN', requiresTranslation: false },
  { code: 'hinglish', label: 'Hinglish', speechLocale: 'en-IN', requiresTranslation: false },
  { code: 'hi', label: 'Hindi', speechLocale: 'hi-IN', requiresTranslation: true },
  { code: 'bn', label: 'Bengali', speechLocale: 'bn-IN', requiresTranslation: true },
  { code: 'ta', label: 'Tamil', speechLocale: 'ta-IN', requiresTranslation: true },
  { code: 'te', label: 'Telugu', speechLocale: 'te-IN', requiresTranslation: true },
  { code: 'mr', label: 'Marathi', speechLocale: 'mr-IN', requiresTranslation: true },
  { code: 'gu', label: 'Gujarati', speechLocale: 'gu-IN', requiresTranslation: true },
  { code: 'kn', label: 'Kannada', speechLocale: 'kn-IN', requiresTranslation: true },
  { code: 'ml', label: 'Malayalam', speechLocale: 'ml-IN', requiresTranslation: true },
  { code: 'pa', label: 'Punjabi', speechLocale: 'pa-IN', requiresTranslation: true },
  { code: 'or', label: 'Odia', speechLocale: 'or-IN', requiresTranslation: true },
  { code: 'ur', label: 'Urdu', speechLocale: 'ur-IN', requiresTranslation: true },
];

export const LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code) as [
  LanguageCode,
  ...LanguageCode[]
];

export function getLanguageOption(code: string): LanguageOption {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) ?? SUPPORTED_LANGUAGES[0];
}

export function isValidLanguageCode(code: unknown): code is LanguageCode {
  return typeof code === 'string' && SUPPORTED_LANGUAGES.some((l) => l.code === code);
}