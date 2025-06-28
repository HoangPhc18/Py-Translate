import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Các tệp ngôn ngữ
const resources = {
  en: {
    translation: {
      appTitle: 'Text Translator',
      inputLabel: 'Enter Text:',
      outputLabel: 'Translation Result:',
      speakInputText: 'Speak Input Text',
      speakOutputText: 'Speak Translation',
      translateFromImage: 'Translate Text from Image',
      translateSpeech: 'Translate Speech',
      clearText: 'Clear Text',
      targetLanguage: 'Target Language:',
      enterTextPrompt: 'Please enter text to translate.',
      errorOcr: 'Error recognizing text from image:',
      errorSpeech: 'Could not understand speech',
      errorSpeechRequest: 'Could not request speech recognition results;',
      listening: 'Listening...',
      searchLanguage: 'Search:',
      selectLanguage: 'Select Target Language',
      inputPlaceholder: 'Enter text to translate',
      outputPlaceholder: 'Translation will appear here',
      copyText: 'Copy text',
      settings: 'Settings',
      autoTranslate: 'Auto translate',
      fullscreen: 'Fullscreen',
      exitFullscreen: 'Exit fullscreen',
      translating: 'Translating...',
      voiceInput: 'Voice input',
      imageTranslate: 'Image translate',
      detectLanguage: 'Detect language'
    }
  },
  vi: {
    translation: {
      appTitle: 'Trình Dịch Văn Bản',
      inputLabel: 'Nhập Văn Bản:',
      outputLabel: 'Kết Quả Dịch:',
      speakInputText: 'Đọc Văn Bản Nhập',
      speakOutputText: 'Đọc Kết Quả Dịch',
      translateFromImage: 'Dịch Văn Bản Từ Hình Ảnh',
      translateSpeech: 'Dịch Giọng Nói',
      clearText: 'Xóa Văn Bản',
      targetLanguage: 'Ngôn Ngữ Đích:',
      enterTextPrompt: 'Vui lòng nhập văn bản cần dịch.',
      errorOcr: 'Lỗi khi nhận dạng văn bản từ hình ảnh:',
      errorSpeech: 'Không thể hiểu giọng nói',
      errorSpeechRequest: 'Không thể yêu cầu kết quả;',
      listening: 'Đang Nghe...',
      searchLanguage: 'Tìm:',
      selectLanguage: 'Chọn Ngôn Ngữ Đích',
      inputPlaceholder: 'Nhập văn bản để dịch',
      outputPlaceholder: 'Bản dịch sẽ hiển thị ở đây',
      copyText: 'Sao chép văn bản',
      settings: 'Cài đặt',
      autoTranslate: 'Tự động dịch',
      fullscreen: 'Toàn màn hình',
      exitFullscreen: 'Thoát toàn màn hình',
      translating: 'Đang dịch...',
      voiceInput: 'Nhập bằng giọng nói',
      imageTranslate: 'Dịch từ hình ảnh',
      detectLanguage: 'Tự động nhận diện'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'vi', // Ngôn ngữ mặc định
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react đã xử lý XSS
    }
  });

export default i18n; 