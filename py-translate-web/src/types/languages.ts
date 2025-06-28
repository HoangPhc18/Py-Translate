export interface Language {
  name: string;
  code: string;
}

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
  'Tiếng Bồ Đào Nha': 'pt',
};

export const LANGUAGE_LIST: Language[] = Object.entries(LANGUAGES).map(
  ([name, code]) => ({ name, code })
); 