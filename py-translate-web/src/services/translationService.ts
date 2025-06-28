import axios from 'axios';
import { LANGUAGES } from '../types/languages';

// Sử dụng LibreTranslate API - API dịch mã nguồn mở với độ chính xác cao hơn
// Có thể sử dụng public API hoặc tự host
const LIBRE_TRANSLATE_API = 'https://libretranslate.de/translate';
const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

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

// Hàm cải tiến để phát hiện ngôn ngữ dựa trên các ký tự đặc trưng
export const detectLanguage = (text: string): string => {
  // Chuẩn hóa văn bản trước khi phân tích
  const normalizedText = text.trim().toLowerCase();
  
  if (!normalizedText) return 'en';
  
  // Tính điểm cho mỗi ngôn ngữ dựa trên số lượng ký tự đặc trưng
  let viScore = 0;
  let jaScore = 0;
  let koScore = 0;
  let zhScore = 0;
  let enScore = 0;
  
  // Các từ tiếng Việt phổ biến để kiểm tra
  const vietnameseWords = ['xin', 'chào', 'cảm', 'ơn', 'không', 'có', 'tôi', 'bạn', 'và', 'hoặc', 'là'];
  
  // Kiểm tra nếu văn bản chứa các từ tiếng Việt phổ biến
  for (const word of vietnameseWords) {
    if (normalizedText.includes(word)) {
      viScore += 5;
    }
  }
  
  // Kiểm tra các ký tự tiếng Việt đặc trưng
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi;
  const viMatches = normalizedText.match(vietnamesePattern);
  if (viMatches) {
    viScore += viMatches.length * 10;
  }
  
  // Kiểm tra các ký tự tiếng Nhật
  const japanesePattern = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/g;
  const jaMatches = normalizedText.match(japanesePattern);
  if (jaMatches) {
    jaScore += jaMatches.length * 10;
  }
  
  // Kiểm tra các ký tự tiếng Hàn
  const koreanPattern = /[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f\uffa0-\uffdc]/g;
  const koMatches = normalizedText.match(koreanPattern);
  if (koMatches) {
    koScore += koMatches.length * 10;
  }
  
  // Kiểm tra các ký tự tiếng Trung
  const chinesePattern = /[\u4e00-\u9fff\uf900-\ufaff]/g;
  const zhMatches = normalizedText.match(chinesePattern);
  if (zhMatches) {
    zhScore += zhMatches.length * 10;
  }
  
  // Kiểm tra các từ tiếng Anh phổ biến
  const englishWords = ['the', 'is', 'are', 'and', 'or', 'but', 'if', 'that', 'this', 'these', 'those', 'hello', 'hi'];
  for (const word of englishWords) {
    if (normalizedText.includes(word)) {
      enScore += 5;
    }
  }
  
  // Kiểm tra tỷ lệ ký tự Latin (tiếng Anh)
  const latinPattern = /[a-z]/g;
  const latinMatches = normalizedText.match(latinPattern);
  if (latinMatches) {
    // Nếu có nhiều ký tự Latin nhưng không có dấu tiếng Việt, có thể là tiếng Anh
    if (latinMatches.length > 3 && !viMatches) {
      enScore += latinMatches.length;
    }
  }
  
  // Xác định ngôn ngữ dựa trên điểm cao nhất
  const scores = [
    { lang: 'vi', score: viScore },
    { lang: 'ja', score: jaScore },
    { lang: 'ko', score: koScore },
    { lang: 'zh-cn', score: zhScore },
    { lang: 'en', score: enScore }
  ];
  
  // Sắp xếp theo điểm giảm dần
  scores.sort((a, b) => b.score - a.score);
  
  // Kiểm tra các trường hợp đặc biệt
  if (normalizedText === 'xin chào' || normalizedText.startsWith('xin chào')) {
    return 'vi';
  }
  
  if (normalizedText === 'hello' || normalizedText === 'hi' || normalizedText.startsWith('hello') || normalizedText.startsWith('hi ')) {
    return 'en';
  }
  
  // Nếu điểm cao nhất lớn hơn 0, trả về ngôn ngữ đó
  if (scores[0].score > 0) {
    return scores[0].lang;
  }
  
  // Mặc định là tiếng Anh
  return 'en';
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

// Chuyển đổi mã ngôn ngữ từ định dạng của chúng ta sang định dạng của LibreTranslate
const convertToLibreTranslateCode = (langCode: string): string => {
  const codeMap: Record<string, string> = {
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

// Hàm dịch sử dụng LibreTranslate API
const translateWithLibreTranslate = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> => {
  try {
    // Chuyển đổi mã ngôn ngữ sang định dạng của LibreTranslate
    const sourceCode = convertToLibreTranslateCode(sourceLang);
    const targetCode = convertToLibreTranslateCode(targetLang);
    
    const response = await axios.post(LIBRE_TRANSLATE_API, {
      q: text,
      source: sourceCode,
      target: targetCode,
      format: 'text'
    });
    
    if (response.data && response.data.translatedText) {
      return response.data.translatedText;
    } else {
      throw new Error('Không nhận được kết quả dịch từ LibreTranslate');
    }
  } catch (error) {
    console.error('Lỗi khi sử dụng LibreTranslate:', error);
    throw error;
  }
};

// Hàm dịch sử dụng MyMemory API (dự phòng)
const translateWithMyMemory = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> => {
  try {
    const response = await axios.get(MYMEMORY_API, {
      params: {
        q: text,
        langpair: `${sourceLang}|${targetLang}`,
        de: 'a@b.c' // Email giả để sử dụng API miễn phí
      }
    });

    if (response.data && response.data.responseData && response.data.responseData.translatedText) {
      return response.data.responseData.translatedText;
    } else if (response.data && response.data.responseDetails) {
      throw new Error(`Lỗi dịch: ${response.data.responseDetails}`);
    } else {
      throw new Error('Không nhận được kết quả dịch từ MyMemory');
    }
  } catch (error) {
    console.error('Lỗi khi sử dụng MyMemory:', error);
    throw error;
  }
};

export const translateText = async (
  text: string, 
  targetLanguage: string
): Promise<string> => {
  try {
    // Lấy mã ngôn ngữ từ tên ngôn ngữ
    const targetLangCode = LANGUAGES[targetLanguage];
    
    // Phát hiện ngôn ngữ nguồn từ văn bản
    const sourceLangCode = detectLanguage(text);
    
    // Nếu ngôn ngữ nguồn và đích giống nhau, trả về nguyên văn
    if (sourceLangCode === targetLangCode) {
      return text;
    }
    
    // Kiểm tra và áp dụng các điều chỉnh cho các cụm từ thường dịch sai
    const correctedText = applyCommonCorrections(text, sourceLangCode, targetLangCode);
    if (correctedText !== null) {
      return correctedText;
    }
    
    // Thử dịch với LibreTranslate trước
    try {
      return await translateWithLibreTranslate(text, sourceLangCode, targetLangCode);
    } catch (libreError) {
      console.log('Dự phòng sang MyMemory do lỗi LibreTranslate:', libreError);
      // Nếu LibreTranslate thất bại, sử dụng MyMemory làm dự phòng
      return await translateWithMyMemory(text, sourceLangCode, targetLangCode);
    }
  } catch (error) {
    console.error('Lỗi dịch:', error);
    throw error;
  }
};

// Phát âm văn bản sử dụng Web Speech API
export const speakText = (text: string, langCode: string): void => {
  if (!text) return;
  
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    window.speechSynthesis.speak(utterance);
  } else {
    console.error('Trình duyệt không hỗ trợ Speech Synthesis');
  }
};

// Nhận dạng giọng nói sử dụng Web Speech API
export const recognizeSpeech = (
  language: string, 
  onResult: (text: string) => void, 
  onError: (error: string) => void
): void => {
  if (!('webkitSpeechRecognition' in window)) {
    onError('Trình duyệt không hỗ trợ Speech Recognition');
    return;
  }
  
  // @ts-ignore - webkitSpeechRecognition không có trong TypeScript mặc định
  const recognition = new window.webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  
  // Lấy mã ngôn ngữ từ tên ngôn ngữ
  const langCode = LANGUAGES[language] || 'vi-VN';
  recognition.lang = langCode;
  
  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };
  
  recognition.onerror = (event: any) => {
    onError(`Lỗi nhận dạng giọng nói: ${event.error}`);
  };
  
  recognition.start();
}; 