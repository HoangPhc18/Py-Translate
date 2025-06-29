const axios = require('axios');

// LibreTranslate API endpoint for language detection
const LIBRE_TRANSLATE_DETECT_API = 'https://libretranslate.de/detect';

// Simple language detection based on character sets
const detectLanguageLocally = (text) => {
  if (!text || !text.trim()) return 'en';
  
  const normalizedText = text.trim().toLowerCase();
  
  // Check for Vietnamese characters
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi;
  if (vietnamesePattern.test(normalizedText)) {
    return 'vi';
  }
  
  // Check for Japanese characters
  const japanesePattern = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/g;
  if (japanesePattern.test(normalizedText)) {
    return 'ja';
  }
  
  // Check for Korean characters
  const koreanPattern = /[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f\uffa0-\uffdc]/g;
  if (koreanPattern.test(normalizedText)) {
    return 'ko';
  }
  
  // Check for Chinese characters
  const chinesePattern = /[\u4e00-\u9fff\uf900-\ufaff]/g;
  if (chinesePattern.test(normalizedText)) {
    return 'zh-cn';
  }
  
  // Default to English
  return 'en';
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
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing text parameter' });
    }

    try {
      // Try to use LibreTranslate API for language detection
      const response = await axios.post(LIBRE_TRANSLATE_DETECT_API, {
        q: text
      });

      if (response.data && response.data.length > 0) {
        // LibreTranslate returns an array of detected languages with confidence scores
        const detectedLanguages = response.data;
        
        // Sort by confidence and get the most likely language
        detectedLanguages.sort((a, b) => b.confidence - a.confidence);
        const detectedLanguage = detectedLanguages[0];
        
        // Convert from LibreTranslate format if needed
        let langCode = detectedLanguage.language;
        if (langCode === 'zh') {
          langCode = 'zh-cn';
        }
        
        return res.status(200).json({ 
          detectedLanguage: langCode,
          confidence: detectedLanguage.confidence
        });
      } else {
        // Fallback to local detection if LibreTranslate returns empty result
        const detectedLang = detectLanguageLocally(text);
        return res.status(200).json({ 
          detectedLanguage: detectedLang,
          confidence: 0.8,
          method: 'fallback'
        });
      }
    } catch (apiError) {
      console.error('LibreTranslate API error:', apiError.message);
      
      // Fallback to local detection if LibreTranslate API fails
      const detectedLang = detectLanguageLocally(text);
      return res.status(200).json({ 
        detectedLanguage: detectedLang,
        confidence: 0.7,
        method: 'fallback'
      });
    }
  } catch (error) {
    console.error('Language detection error:', error.message);
    return res.status(500).json({ 
      error: 'Language detection service error', 
      details: error.message,
      fallbackLanguage: 'en'
    });
  }
}; 