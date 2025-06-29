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

// Hàm phát hiện ngôn ngữ phía client (dự phòng)
const clientSideDetectLanguage = (text: string): string => {
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
  } catch (error) {
    console.error('Lỗi khi dịch văn bản:', error);
    throw error;
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