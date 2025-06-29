export interface Language {
  name: string;
  code: string;
}

// Map of language names to ISO codes
export const LANGUAGES: Record<string, string> = {
  'Tiếng Anh': 'en',
  'Tiếng Việt': 'vi',
  'Tiếng Hàn': 'ko',
  'Tiếng Nhật': 'ja',
  'Tiếng Trung': 'zh-cn',
  'Tiếng Pháp': 'fr',
  'Tiếng Đức': 'de',
  'Tiếng Ý': 'it',
  'Tiếng Tây Ban Nha': 'es',
  'Tiếng Bồ Đào Nha': 'pt'
};

// List of supported languages
export const LANGUAGE_LIST: Language[] = Object.keys(LANGUAGES).map(name => ({
  name,
  code: LANGUAGES[name]
})); 