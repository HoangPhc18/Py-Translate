const axios = require('axios');

// LibreTranslate API endpoint for language detection
const LIBRE_TRANSLATE_DETECT_API = 'https://libretranslate.de/detect';

// Improved local language detection with more accurate patterns and word lists
const detectLanguageLocally = (text) => {
  if (!text || !text.trim()) return 'en';
  
  const normalizedText = text.trim().toLowerCase();
  
  // Common words in different languages for more accurate detection
  const languageWords = {
    'vi': ['và', 'hoặc', 'không', 'là', 'có', 'được', 'trong', 'của', 'cho', 'với', 'tôi', 'bạn', 'chúng', 'họ', 'những', 'các', 'một', 'hai', 'ba', 'bốn', 'năm'],
    'en': ['the', 'and', 'or', 'not', 'is', 'are', 'in', 'of', 'to', 'for', 'with', 'i', 'you', 'we', 'they', 'this', 'that', 'one', 'two', 'three', 'four', 'five'],
    'fr': ['le', 'la', 'les', 'et', 'ou', 'ne', 'pas', 'est', 'sont', 'dans', 'de', 'à', 'pour', 'avec', 'je', 'tu', 'nous', 'ils', 'un', 'deux', 'trois'],
    'de': ['der', 'die', 'das', 'und', 'oder', 'nicht', 'ist', 'sind', 'in', 'von', 'zu', 'für', 'mit', 'ich', 'du', 'wir', 'sie', 'ein', 'zwei', 'drei'],
    'es': ['el', 'la', 'los', 'las', 'y', 'o', 'no', 'es', 'son', 'en', 'de', 'a', 'para', 'con', 'yo', 'tú', 'nosotros', 'ellos', 'uno', 'dos', 'tres'],
    'it': ['il', 'la', 'i', 'le', 'e', 'o', 'non', 'è', 'sono', 'in', 'di', 'a', 'per', 'con', 'io', 'tu', 'noi', 'loro', 'uno', 'due', 'tre'],
    'pt': ['o', 'a', 'os', 'as', 'e', 'ou', 'não', 'é', 'são', 'em', 'de', 'para', 'com', 'eu', 'tu', 'nós', 'eles', 'um', 'dois', 'três']
  };
  
  // Calculate language scores based on word matches
  const scores = {
    'vi': 0, 'en': 0, 'ja': 0, 'ko': 0, 'zh-cn': 0, 'fr': 0, 'de': 0, 'es': 0, 'it': 0, 'pt': 0
  };
  
  // Split text into words
  const words = normalizedText.split(/\s+/);
  
  // Check for word matches in each language
  for (const word of words) {
    for (const [lang, wordList] of Object.entries(languageWords)) {
      if (wordList.includes(word)) {
        scores[lang] += 3; // Give more weight to word matches
      }
    }
  }
  
  // Check for Vietnamese characters (diacritics)
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi;
  if (vietnamesePattern.test(normalizedText)) {
    scores['vi'] += normalizedText.match(vietnamesePattern).length * 5;
  }
  
  // Check for Japanese characters
  const hiraganaPattern = /[\u3040-\u309F]/g;
  const katakanaPattern = /[\u30A0-\u30FF]/g;
  const kanjiPattern = /[\u4E00-\u9FAF]/g;
  
  const hiraganaMatches = normalizedText.match(hiraganaPattern);
  const katakanaMatches = normalizedText.match(katakanaPattern);
  const kanjiMatchesJa = normalizedText.match(kanjiPattern);
  
  if (hiraganaMatches) scores['ja'] += hiraganaMatches.length * 5;
  if (katakanaMatches) scores['ja'] += katakanaMatches.length * 5;
  if (kanjiMatchesJa) scores['ja'] += kanjiMatchesJa.length * 3;
  
  // Check for Korean characters
  const hangulPattern = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/g;
  const hangulMatches = normalizedText.match(hangulPattern);
  if (hangulMatches) {
    scores['ko'] += hangulMatches.length * 5;
  }
  
  // Check for Chinese characters (but not counted for Japanese)
  const chinesePattern = /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/g;
  const chineseMatches = normalizedText.match(chinesePattern);
  if (chineseMatches && scores['ja'] < 10) { // If not already strongly Japanese
    scores['zh-cn'] += chineseMatches.length * 5;
  }
  
  // Check for Latin characters (for European languages)
  const latinPattern = /[a-z]/g;
  const latinMatches = normalizedText.match(latinPattern);
  
  // If we have Latin characters but no strong signals for Asian languages
  if (latinMatches && 
      scores['vi'] < 10 && 
      scores['ja'] < 10 && 
      scores['ko'] < 10 && 
      scores['zh-cn'] < 10) {
    
    // Check for specific patterns in European languages
    const frenchPattern = /[éèêëàâäôöùûüÿçœæ]/g;
    const germanPattern = /[äöüßẞ]/g;
    const spanishPattern = /[áéíóúüñ¿¡]/g;
    const italianPattern = /[àèéìíîòóùú]/g;
    const portuguesePattern = /[áàâãéêíóôõúç]/g;
    
    const frenchMatches = normalizedText.match(frenchPattern);
    const germanMatches = normalizedText.match(germanPattern);
    const spanishMatches = normalizedText.match(spanishPattern);
    const italianMatches = normalizedText.match(italianPattern);
    const portugueseMatches = normalizedText.match(portuguesePattern);
    
    if (frenchMatches) scores['fr'] += frenchMatches.length * 5;
    if (germanMatches) scores['de'] += germanMatches.length * 5;
    if (spanishMatches) scores['es'] += spanishMatches.length * 5;
    if (italianMatches) scores['it'] += italianMatches.length * 5;
    if (portugueseMatches) scores['pt'] += portugueseMatches.length * 5;
    
    // If no specific European language is detected, default to English
    if (scores['fr'] < 5 && scores['de'] < 5 && scores['es'] < 5 && 
        scores['it'] < 5 && scores['pt'] < 5) {
      scores['en'] += latinMatches.length;
    }
  }
  
  // Check for common phrases that strongly indicate a specific language
  const commonPhrases = {
    'vi': ['xin chào', 'cảm ơn', 'tạm biệt', 'làm ơn', 'xin lỗi'],
    'en': ['hello', 'thank you', 'goodbye', 'please', 'sorry'],
    'fr': ['bonjour', 'merci', 'au revoir', 's\'il vous plaît', 'pardon'],
    'de': ['hallo', 'danke', 'auf wiedersehen', 'bitte', 'entschuldigung'],
    'es': ['hola', 'gracias', 'adiós', 'por favor', 'lo siento'],
    'ja': ['こんにちは', 'ありがとう', 'さようなら', 'お願いします', 'すみません'],
    'ko': ['안녕하세요', '감사합니다', '안녕히 가세요', '제발', '죄송합니다'],
    'zh-cn': ['你好', '谢谢', '再见', '请', '对不起'],
    'it': ['ciao', 'grazie', 'arrivederci', 'per favore', 'scusa'],
    'pt': ['olá', 'obrigado', 'adeus', 'por favor', 'desculpe']
  };
  
  for (const [lang, phrases] of Object.entries(commonPhrases)) {
    for (const phrase of phrases) {
      if (normalizedText.includes(phrase)) {
        scores[lang] += 10; // Strong indicator
      }
    }
  }
  
  // Get the language with the highest score
  let highestScore = 0;
  let detectedLanguage = 'en';  // Default to English
  
  for (const [lang, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      detectedLanguage = lang;
    }
  }
  
  // If the highest score is still very low, default to English
  if (highestScore < 3) {
    detectedLanguage = 'en';
  }
  
  return detectedLanguage;
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
        
        // If confidence is low, double-check with local detection
        if (detectedLanguage.confidence < 0.6) {
          const localDetection = detectLanguageLocally(text);
          // If they disagree, use the local detection if it has a strong signal
          if (localDetection !== langCode) {
            // Use local detection as a fallback
            return res.status(200).json({ 
              detectedLanguage: localDetection,
              confidence: 0.7,
              method: 'combined'
            });
          }
        }
        
        return res.status(200).json({ 
          detectedLanguage: langCode,
          confidence: detectedLanguage.confidence,
          method: 'api'
        });
      } else {
        // Fallback to local detection if LibreTranslate returns empty result
        const detectedLang = detectLanguageLocally(text);
        return res.status(200).json({ 
          detectedLanguage: detectedLang,
          confidence: 0.8,
          method: 'local'
        });
      }
    } catch (apiError) {
      console.error('LibreTranslate API error:', apiError.message);
      
      // Fallback to local detection if LibreTranslate API fails
      const detectedLang = detectLanguageLocally(text);
      return res.status(200).json({ 
        detectedLanguage: detectedLang,
        confidence: 0.7,
        method: 'local-fallback'
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