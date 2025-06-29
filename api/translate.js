const axios = require('axios');

// LibreTranslate API endpoint
const LIBRE_TRANSLATE_API = 'https://libretranslate.de/translate';
const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

// Convert language code to LibreTranslate format
const convertToLibreTranslateCode = (langCode) => {
  const codeMap = {
    'zh-cn': 'zh',
    'ja': 'ja',
    'ko': 'ko',
    'en': 'en',
    'vi': 'vi',
    'fr': 'fr',
    'de': 'de',
    'it': 'it',
    'es': 'es',
    'pt': 'pt'
  };
  
  return codeMap[langCode] || langCode;
};

// Simple dictionary for common translations as fallback
const commonTranslations = {
  'en': {
    'hello': {
      'vi': 'xin chào',
      'fr': 'bonjour',
      'de': 'hallo',
      'ja': 'こんにちは',
      'ko': '안녕하세요',
      'zh-cn': '你好',
      'es': 'hola',
      'it': 'ciao',
      'pt': 'olá'
    },
    'goodbye': {
      'vi': 'tạm biệt',
      'fr': 'au revoir',
      'de': 'auf wiedersehen',
      'ja': 'さようなら',
      'ko': '안녕히 가세요',
      'zh-cn': '再见',
      'es': 'adiós',
      'it': 'arrivederci',
      'pt': 'adeus'
    },
    'thank you': {
      'vi': 'cảm ơn',
      'fr': 'merci',
      'de': 'danke',
      'ja': 'ありがとう',
      'ko': '감사합니다',
      'zh-cn': '谢谢',
      'es': 'gracias',
      'it': 'grazie',
      'pt': 'obrigado'
    }
  },
  'vi': {
    'xin chào': {
      'en': 'hello',
      'fr': 'bonjour',
      'de': 'hallo',
      'ja': 'こんにちは',
      'ko': '안녕하세요',
      'zh-cn': '你好',
      'es': 'hola',
      'it': 'ciao',
      'pt': 'olá'
    },
    'tạm biệt': {
      'en': 'goodbye',
      'fr': 'au revoir',
      'de': 'auf wiedersehen',
      'ja': 'さようなら',
      'ko': '안녕히 가세요',
      'zh-cn': '再见',
      'es': 'adiós',
      'it': 'arrivederci',
      'pt': 'adeus'
    },
    'cảm ơn': {
      'en': 'thank you',
      'fr': 'merci',
      'de': 'danke',
      'ja': 'ありがとう',
      'ko': '감사합니다',
      'zh-cn': '谢谢',
      'es': 'gracias',
      'it': 'grazie',
      'pt': 'obrigado'
    }
  }
};

// Try to translate using the common translations dictionary
const translateWithDictionary = (text, sourceLang, targetLang) => {
  const lowerText = text.trim().toLowerCase();
  
  // Check if we have translations for this source language
  if (commonTranslations[sourceLang] && commonTranslations[sourceLang][lowerText]) {
    // Check if we have a translation for the target language
    if (commonTranslations[sourceLang][lowerText][targetLang]) {
      return commonTranslations[sourceLang][lowerText][targetLang];
    }
  }
  
  // No translation found
  return null;
};

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, sourceLang, targetLang } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // If source and target languages are the same, return the original text
    if (sourceLang === targetLang) {
      return res.status(200).json({ translatedText: text });
    }

    // Try to use dictionary translation first
    const dictionaryTranslation = translateWithDictionary(text, sourceLang, targetLang);
    if (dictionaryTranslation) {
      return res.status(200).json({ 
        translatedText: dictionaryTranslation,
        method: 'dictionary'
      });
    }

    // Convert language codes
    const sourceCode = sourceLang ? convertToLibreTranslateCode(sourceLang) : 'auto';
    const targetCode = convertToLibreTranslateCode(targetLang);

    try {
      // Try LibreTranslate API
      const response = await axios.post(LIBRE_TRANSLATE_API, {
        q: text,
        source: sourceCode,
        target: targetCode,
        format: 'text'
      });

      if (response.data && response.data.translatedText) {
        return res.status(200).json({ 
          translatedText: response.data.translatedText,
          detectedLanguage: response.data.detectedLanguage?.language || sourceLang,
          method: 'libretranslate'
        });
      } else {
        throw new Error('No translation received from LibreTranslate');
      }
    } catch (libreError) {
      console.error('LibreTranslate error:', libreError.message);
      
      // Fallback to MyMemory API
      try {
        const response = await axios.get(MYMEMORY_API, {
          params: {
            q: text,
            langpair: `${sourceLang}|${targetLang}`,
            de: 'a@b.c' // Email placeholder for API usage
          }
        });

        if (response.data && response.data.responseData && response.data.responseData.translatedText) {
          return res.status(200).json({ 
            translatedText: response.data.responseData.translatedText,
            method: 'mymemory'
          });
        } else {
          throw new Error('No translation received from MyMemory');
        }
      } catch (myMemoryError) {
        console.error('MyMemory error:', myMemoryError.message);
        
        // Last resort: return original text if all translation attempts fail
        return res.status(200).json({ 
          translatedText: text,
          error: 'Translation services unavailable',
          method: 'original'
        });
      }
    }
  } catch (error) {
    console.error('Translation error:', error.message);
    return res.status(500).json({ 
      error: 'Translation service error', 
      details: error.message,
      translatedText: req.body.text // Return original text as fallback
    });
  }
}; 