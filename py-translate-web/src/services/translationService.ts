import axios from 'axios';

// Use our serverless API endpoints
const API_TRANSLATE = '/api/translate';
const API_DETECT = '/api/detect';

// Định nghĩa kiểu dữ liệu cho các điều chỉnh
interface Corrections {
  [targetLang: string]: string;
}

// Danh sách các cặp từ và cụm từ thường dịch sai để điều chỉnh
const COMMON_CORRECTIONS: Record<string, Record<string, Corrections>> = {
  'vi': { // Tiếng Việt
    'xin chào': { 'en': 'hello' },
    'tạm biệt': { 'en': 'goodbye' },
    'cảm ơn': { 'en': 'thank you' },
    'không có gì': { 'en': "you're welcome" },
    'làm ơn': { 'en': 'please' },
    'xin lỗi': { 'en': 'sorry' },
    'tôi yêu bạn': { 'en': 'I love you' },
    'bạn khỏe không': { 'en': 'how are you' }
  },
  'en': { // Tiếng Anh
    'hello': { 'vi': 'xin chào' },
    'goodbye': { 'vi': 'tạm biệt' },
    'thank you': { 'vi': 'cảm ơn' },
    "you're welcome": { 'vi': 'không có gì' },
    'please': { 'vi': 'làm ơn' },
    'sorry': { 'vi': 'xin lỗi' },
    'i love you': { 'vi': 'tôi yêu bạn' },
    'how are you': { 'vi': 'bạn khỏe không' }
  }
};

// Hàm phát hiện ngôn ngữ sử dụng API serverless
export const detectLanguage = async (text: string): Promise<string> => {
  if (!text.trim()) return 'en';
  
  try {
    const response = await axios.post(API_DETECT, { text });
    return response.data.detectedLanguage || 'en';
  } catch (error) {
    console.error('Lỗi khi phát hiện ngôn ngữ:', error);
    
    // Fallback to client-side detection if API fails
    return clientSideDetectLanguage(text);
  }
};

// Cải tiến hàm phát hiện ngôn ngữ phía client
const clientSideDetectLanguage = (text: string): string => {
  // Chuẩn hóa văn bản trước khi phân tích
  const normalizedText = text.trim().toLowerCase();
  
  if (!normalizedText) return 'en';
  
  // Từ vựng phổ biến cho các ngôn ngữ
  const languageWords: Record<string, string[]> = {
    'vi': ['và', 'hoặc', 'không', 'là', 'có', 'được', 'trong', 'của', 'cho', 'với', 'tôi', 'bạn', 'chúng', 'họ', 'những', 'các'],
    'en': ['the', 'and', 'or', 'not', 'is', 'are', 'in', 'of', 'to', 'for', 'with', 'i', 'you', 'we', 'they', 'this', 'that'],
    'fr': ['le', 'la', 'les', 'et', 'ou', 'ne', 'pas', 'est', 'sont', 'dans', 'de', 'à', 'pour', 'avec', 'je', 'tu', 'nous'],
    'de': ['der', 'die', 'das', 'und', 'oder', 'nicht', 'ist', 'sind', 'in', 'von', 'zu', 'für', 'mit', 'ich', 'du', 'wir'],
    'es': ['el', 'la', 'los', 'las', 'y', 'o', 'no', 'es', 'son', 'en', 'de', 'a', 'para', 'con', 'yo', 'tú', 'nosotros'],
    'it': ['il', 'la', 'i', 'le', 'e', 'o', 'non', 'è', 'sono', 'in', 'di', 'a', 'per', 'con', 'io', 'tu', 'noi'],
    'pt': ['o', 'a', 'os', 'as', 'e', 'ou', 'não', 'é', 'são', 'em', 'de', 'para', 'com', 'eu', 'tu', 'nós', 'eles']
  };
  
  // Tính điểm cho mỗi ngôn ngữ
  const scores: Record<string, number> = {
    'vi': 0, 'en': 0, 'ja': 0, 'ko': 0, 'zh-cn': 0, 'fr': 0, 'de': 0, 'es': 0, 'it': 0, 'pt': 0
  };
  
  // Tách văn bản thành các từ
  const words = normalizedText.split(/\s+/);
  
  // Kiểm tra từng từ có trong danh sách từ vựng của ngôn ngữ nào
  for (const word of words) {
    for (const [lang, wordList] of Object.entries(languageWords)) {
      if (wordList.includes(word)) {
        scores[lang] += 3; // Tăng điểm cho ngôn ngữ tương ứng
      }
    }
  }
  
  // Kiểm tra các ký tự tiếng Việt đặc trưng
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi;
  const viMatches = normalizedText.match(vietnamesePattern);
  if (viMatches) {
    scores['vi'] += viMatches.length * 5;
  }
  
  // Kiểm tra các ký tự tiếng Nhật
  const hiraganaPattern = /[\u3040-\u309F]/g;
  const katakanaPattern = /[\u30A0-\u30FF]/g;
  const kanjiPattern = /[\u4E00-\u9FAF]/g;
  
  const hiraganaMatches = normalizedText.match(hiraganaPattern);
  const katakanaMatches = normalizedText.match(katakanaPattern);
  const kanjiMatches = normalizedText.match(kanjiPattern);
  
  if (hiraganaMatches) scores['ja'] += hiraganaMatches.length * 5;
  if (katakanaMatches) scores['ja'] += katakanaMatches.length * 5;
  if (kanjiMatches) scores['ja'] += kanjiMatches.length * 3;
  
  // Kiểm tra các ký tự tiếng Hàn
  const hangulPattern = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/g;
  const koMatches = normalizedText.match(hangulPattern);
  if (koMatches) {
    scores['ko'] += koMatches.length * 5;
  }
  
  // Kiểm tra các ký tự tiếng Trung (nếu không phải tiếng Nhật)
  const chinesePattern = /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/g;
  const zhMatches = normalizedText.match(chinesePattern);
  if (zhMatches && scores['ja'] < 10) {
    scores['zh-cn'] += zhMatches.length * 5;
  }
  
  // Kiểm tra các ký tự đặc trưng cho các ngôn ngữ châu Âu
  if (scores['vi'] < 10 && scores['ja'] < 10 && scores['ko'] < 10 && scores['zh-cn'] < 10) {
    const frenchPattern = /[éèêëàâäôöùûüÿçœæ]/g;
    const germanPattern = /[äöüßẞ]/g;
    const spanishPattern = /[áéíóúüñ¿¡]/g;
    const italianPattern = /[àèéìíîòóùú]/g;
    const portuguesePattern = /[áàâãéêíóôõúç]/g;
    
    const frMatches = normalizedText.match(frenchPattern);
    const deMatches = normalizedText.match(germanPattern);
    const esMatches = normalizedText.match(spanishPattern);
    const itMatches = normalizedText.match(italianPattern);
    const ptMatches = normalizedText.match(portuguesePattern);
    
    if (frMatches) scores['fr'] += frMatches.length * 5;
    if (deMatches) scores['de'] += deMatches.length * 5;
    if (esMatches) scores['es'] += esMatches.length * 5;
    if (itMatches) scores['it'] += itMatches.length * 5;
    if (ptMatches) scores['pt'] += ptMatches.length * 5;
  }
  
  // Kiểm tra các cụm từ phổ biến
  const commonPhrases: Record<string, string[]> = {
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
        scores[lang] += 10; // Tăng điểm mạnh cho các cụm từ đặc trưng
      }
    }
  }
  
  // Nếu không có tín hiệu rõ ràng, kiểm tra tỷ lệ ký tự Latin
  if (Object.values(scores).every(score => score < 5)) {
    const latinPattern = /[a-z]/g;
    const latinMatches = normalizedText.match(latinPattern);
    if (latinMatches) {
      scores['en'] += latinMatches.length * 0.5; // Ưu tiên tiếng Anh cho văn bản Latin
    }
  }
  
  // Tìm ngôn ngữ có điểm cao nhất
  let highestScore = 0;
  let detectedLanguage = 'en'; // Mặc định là tiếng Anh
  
  for (const [lang, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      detectedLanguage = lang;
    }
  }
  
  // Nếu điểm cao nhất vẫn thấp, mặc định là tiếng Anh
  if (highestScore < 3) {
    detectedLanguage = 'en';
  }
  
  return detectedLanguage;
};

// Hàm kiểm tra và áp dụng các điều chỉnh cho các cụm từ thường dịch sai
const applyCommonCorrections = (
  text: string, 
  sourceLang: string, 
  targetLang: string
): string | null => {
  const normalizedText = text.trim().toLowerCase();
  
  // Kiểm tra xem có điều chỉnh cho ngôn ngữ nguồn không
  if (COMMON_CORRECTIONS[sourceLang]) {
    // Kiểm tra từng cụm từ trong danh sách điều chỉnh
    for (const [phrase, corrections] of Object.entries(COMMON_CORRECTIONS[sourceLang])) {
      // Nếu văn bản chính xác là cụm từ này hoặc bắt đầu bằng cụm từ này + khoảng trắng
      if (normalizedText === phrase || normalizedText.startsWith(`${phrase} `)) {
        // Kiểm tra xem có điều chỉnh cho ngôn ngữ đích không
        if (corrections[targetLang]) {
          // Nếu văn bản chính xác bằng cụm từ, trả về điều chỉnh
          if (normalizedText === phrase) {
            return corrections[targetLang];
          } 
          // Nếu văn bản bắt đầu bằng cụm từ, thay thế phần đầu và giữ nguyên phần còn lại
          else {
            const remaining = text.substring(phrase.length);
            return corrections[targetLang] + remaining;
          }
        }
      }
    }
  }
  
  // Không có điều chỉnh nào được áp dụng
  return null;
};

// Hàm dịch sử dụng API serverless
export const translateText = async (
  text: string, 
  targetLanguage: string
): Promise<string> => {
  if (!text.trim()) return '';
  
  try {
    // Kiểm tra các điều chỉnh thủ công trước
    const sourceLang = await detectLanguage(text);
    const correction = applyCommonCorrections(text, sourceLang, targetLanguage);
    
    if (correction) {
      return correction;
    }
    
    // Nếu không có điều chỉnh thủ công, sử dụng API dịch
    try {
      const response = await axios.post(API_TRANSLATE, {
        text,
        sourceLang,
        targetLang: targetLanguage
      });
      
      if (response.data && response.data.translatedText) {
        return response.data.translatedText;
      } else {
        throw new Error('Không nhận được kết quả dịch');
      }
    } catch (apiError) {
      console.error('Lỗi khi gọi API dịch:', apiError);
      
      // Nếu API lỗi, thử dùng điều chỉnh thủ công một lần nữa nhưng với yêu cầu thấp hơn
      const fallbackCorrection = applyCommonCorrections(text.toLowerCase(), sourceLang, targetLanguage);
      if (fallbackCorrection) {
        return fallbackCorrection;
      }
      
      // Nếu không có điều chỉnh nào phù hợp, trả về văn bản gốc
      return `[${text}]`;
    }
  } catch (error) {
    console.error('Lỗi khi dịch văn bản:', error);
    return `[${text}]`;
  }
};

// Hàm phát âm văn bản (chỉ hoạt động trên trình duyệt)
export const speakText = (text: string, langCode: string): void => {
  if (!text || !window.speechSynthesis) return;
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;
  window.speechSynthesis.speak(utterance);
};

// Hàm nhận dạng giọng nói (chỉ hoạt động trên trình duyệt)
export const recognizeSpeech = (
  language: string, 
  onResult: (text: string) => void, 
  onError: (error: string) => void
): void => {
  // Kiểm tra hỗ trợ Web Speech API
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    onError('Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.');
    return;
  }

  // @ts-ignore - Web Speech API không có trong TypeScript tiêu chuẩn
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.lang = language;
  recognition.continuous = false;
  recognition.interimResults = false;
  
  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };
  
  recognition.onerror = (event: any) => {
    onError(`Lỗi nhận dạng: ${event.error}`);
  };
  
  recognition.start();
}; 