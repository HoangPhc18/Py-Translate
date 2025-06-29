const axios = require('axios');

// LibreTranslate API endpoint
const LIBRE_TRANSLATE_API = 'https://libretranslate.de/translate';

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

    // Convert language codes
    const sourceCode = sourceLang ? convertToLibreTranslateCode(sourceLang) : 'auto';
    const targetCode = convertToLibreTranslateCode(targetLang);

    // Call LibreTranslate API
    const response = await axios.post(LIBRE_TRANSLATE_API, {
      q: text,
      source: sourceCode,
      target: targetCode,
      format: 'text'
    });

    if (response.data && response.data.translatedText) {
      return res.status(200).json({ 
        translatedText: response.data.translatedText,
        detectedLanguage: response.data.detectedLanguage?.language || sourceLang
      });
    } else {
      return res.status(500).json({ error: 'Translation failed' });
    }
  } catch (error) {
    console.error('Translation error:', error.message);
    return res.status(500).json({ 
      error: 'Translation service error', 
      details: error.message 
    });
  }
}; 