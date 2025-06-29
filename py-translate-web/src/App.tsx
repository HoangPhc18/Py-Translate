import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert, Badge, Card, Navbar, Nav, Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { 
  FiMic, 
  FiImage, 
  FiVolume2, 
  FiTrash2, 
  FiCopy, 
  FiSettings, 
  FiGlobe, 
  FiRepeat, 
  FiChevronDown,
  FiMaximize2,
  FiX,
  FiCheck
} from 'react-icons/fi';
import LanguageSelector from './components/LanguageSelector';
import { translateText, speakText, recognizeSpeech, detectLanguage } from './services/translationService';
import { LANGUAGES } from './types/languages';
import Tesseract from 'tesseract.js';
import './App.css';

const App: React.FC = () => {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Tiếng Anh'); // Mặc định là tiếng Anh
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [autoTranslate, setAutoTranslate] = useState<boolean>(true);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputTextareaRef = useRef<HTMLTextAreaElement>(null);
  const outputTextareaRef = useRef<HTMLTextAreaElement>(null);
  const lastTranslatedText = useRef<string>('');
  const lastSelectedLanguage = useRef<string>(selectedLanguage);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Xử lý dịch văn bản
  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) {
      setOutputText(t('enterTextPrompt'));
      return;
    }

    try {
      setIsTranslating(true);
      setError(null);
      
      // Phát hiện ngôn ngữ đầu vào
      const detectedLang = await detectLanguage(inputText);
      setDetectedLanguage(detectedLang);
      
      const translatedText = await translateText(inputText, selectedLanguage);
      setOutputText(translatedText);
      
      // Lưu lại văn bản đã dịch và ngôn ngữ đã chọn
      lastTranslatedText.current = inputText;
      lastSelectedLanguage.current = selectedLanguage;
    } catch (err) {
      setError('Lỗi dịch thuật. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  }, [inputText, selectedLanguage, t]);

  // Tự động dịch khi thay đổi ngôn ngữ nếu có văn bản đầu vào
  useEffect(() => {
    if (inputText.trim() && (selectedLanguage !== lastSelectedLanguage.current)) {
      handleTranslate();
    }
  }, [selectedLanguage, handleTranslate, inputText]);

  // Xử lý khi thay đổi văn bản đầu vào với debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    
    if (newText.trim() === '') {
      setOutputText('');
      setDetectedLanguage('');
      return;
    }
    
    if (autoTranslate) {
      // Hủy timer trước đó nếu có
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Đặt timer mới để dịch sau 800ms kể từ lần nhập cuối cùng
      debounceTimerRef.current = setTimeout(async () => {
        // Phát hiện ngôn ngữ và dịch
        const detectedLang = await detectLanguage(newText);
        setDetectedLanguage(detectedLang);
        handleTranslate();
      }, 800);
    }
  };

  // Xử lý khi thay đổi ngôn ngữ đích
  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    // useEffect sẽ tự động gọi handleTranslate khi selectedLanguage thay đổi
  };

  // Xử lý đọc văn bản đầu vào
  const handleSpeakInput = () => {
    if (inputText.trim()) {
      // Sử dụng ngôn ngữ đã phát hiện
      const langCode = detectedLanguage || 'auto';
      speakText(inputText, langCode);
    }
  };

  // Xử lý đọc văn bản đầu ra
  const handleSpeakOutput = () => {
    if (outputText.trim() && outputText !== t('enterTextPrompt')) {
      const langCode = LANGUAGES[selectedLanguage];
      speakText(outputText, langCode);
    }
  };

  // Xử lý xóa văn bản
  const handleClearText = () => {
    setInputText('');
    setOutputText('');
    setError(null);
    setDetectedLanguage('');
    lastTranslatedText.current = '';
    if (inputTextareaRef.current) {
      inputTextareaRef.current.focus();
    }
  };

  // Xử lý nhận dạng giọng nói
  const handleSpeechRecognition = () => {
    setIsListening(true);
    setError(null);
    
    recognizeSpeech(
      'Tiếng Việt', // Mặc định nhận dạng tiếng Việt
      (recognizedText) => {
        setInputText(recognizedText);
        setIsListening(false);
        // Tự động dịch sau khi nhận dạng
        setTimeout(() => handleTranslate(), 300);
      },
      (errorMsg) => {
        setError(errorMsg);
        setIsListening(false);
      }
    );
  };

  // Xử lý chọn file hình ảnh
  const handleImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Xử lý OCR từ hình ảnh
  const handleImageOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsTranslating(true);
    setError(null);
    
    try {
      const result = await Tesseract.recognize(file, 'vie+eng');
      const recognizedText = result.data.text;
      setInputText(recognizedText);
      // Tự động dịch sau khi nhận dạng
      setTimeout(() => handleTranslate(), 300);
    } catch (err) {
      setError(`${t('errorOcr')} ${err}`);
      console.error(err);
    } finally {
      setIsTranslating(false);
      // Reset input để có thể chọn lại cùng một file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Hủy timer khi component unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Xử lý bật/tắt tự động dịch
  const toggleAutoTranslate = () => {
    setAutoTranslate(!autoTranslate);
  };

  // Lấy tên ngôn ngữ từ mã ngôn ngữ đã phát hiện
  const getLanguageName = (langCode: string): string => {
    // Đảo ngược object LANGUAGES để lấy tên từ mã
    const langNames: Record<string, string> = {};
    Object.entries(LANGUAGES).forEach(([name, code]) => {
      langNames[code] = name;
    });
    
    return langNames[langCode] || langCode;
  };

  // Xử lý sao chép văn bản
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Xử lý đổi ngôn ngữ
  const handleSwapLanguages = () => {
    if (detectedLanguage) {
      const detectedLangName = getLanguageName(detectedLanguage);
      if (detectedLangName) {
        const currentSelectedLang = selectedLanguage;
        setSelectedLanguage(detectedLangName);
        setInputText(outputText);
        setOutputText('');
        // Đặt detectedLanguage thành mã ngôn ngữ của ngôn ngữ đích trước đó
        const prevTargetLangCode = LANGUAGES[currentSelectedLang];
        setDetectedLanguage(prevTargetLangCode || 'en');
      }
    }
  };

  // Xử lý chế độ toàn màn hình
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  // Tự động điều chỉnh chiều cao của textarea
  useEffect(() => {
    const adjustHeight = (textarea: HTMLTextAreaElement | null) => {
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    adjustHeight(inputTextareaRef.current);
    adjustHeight(outputTextareaRef.current);
  }, [inputText, outputText]);

  return (
    <>
      <Navbar bg="light" expand="lg" className="mb-3">
        <Container>
          <Navbar.Brand href="#home">
            <FiGlobe className="me-2" size={24} />
            {t('appTitle')}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Dropdown>
                <Dropdown.Toggle variant="light" id="dropdown-settings">
                  <FiSettings className="me-1" /> {t('settings')}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item>
                    <Form.Check 
                      type="switch"
                      id="auto-translate-switch"
                      label={t('autoTranslate')}
                      checked={autoTranslate}
                      onChange={toggleAutoTranslate}
                    />
                  </Dropdown.Item>
                  <Dropdown.Item onClick={toggleFullscreen}>
                    <FiMaximize2 className="me-2" /> {fullscreen ? t('exitFullscreen') : t('fullscreen')}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className={`app-container ${fullscreen ? 'fullscreen' : ''}`}>
        <Card className="translator-card">
          <Card.Body className="p-0">
            <div className="language-bar">
              <div className="source-language">
                <Badge bg="info" className="language-badge">
                  {detectedLanguage ? getLanguageName(detectedLanguage) : t('detectLanguage')}
                </Badge>
              </div>
              
              <Button 
                variant="light" 
                className="swap-btn"
                onClick={handleSwapLanguages}
                disabled={!detectedLanguage || !outputText}
              >
                <FiRepeat />
              </Button>
              
              <div className="target-language">
                <Dropdown>
                  <Dropdown.Toggle variant="light" id="dropdown-language" className="language-selector-btn">
                    {selectedLanguage} <FiChevronDown />
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="language-dropdown">
                    {Object.keys(LANGUAGES).map((lang) => (
                      <Dropdown.Item 
                        key={lang} 
                        onClick={() => handleLanguageChange(lang)}
                        active={selectedLanguage === lang}
                      >
                        {lang}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
            
            <div className="translation-container">
              <div className="input-container">
                <textarea
                  ref={inputTextareaRef}
                  className="translation-textarea"
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder={t('inputPlaceholder')}
                />
                
                <div className="textarea-actions">
                  <Button 
                    variant="light" 
                    size="sm" 
                    className="action-btn"
                    onClick={handleSpeakInput}
                    disabled={!inputText.trim()}
                    title={t('speakInputText')}
                  >
                    <FiVolume2 />
                  </Button>
                  
                  <Button 
                    variant="light" 
                    size="sm" 
                    className="action-btn"
                    onClick={() => handleCopyText(inputText)}
                    disabled={!inputText.trim()}
                    title={t('copyText')}
                  >
                    <FiCopy />
                  </Button>
                  
                  <Button 
                    variant="light" 
                    size="sm" 
                    className="action-btn"
                    onClick={handleClearText}
                    title={t('clearText')}
                  >
                    <FiTrash2 />
                  </Button>
                </div>
              </div>
              
              <div className="output-container">
                <textarea
                  ref={outputTextareaRef}
                  className="translation-textarea"
                  value={isTranslating ? t('translating') : outputText}
                  readOnly
                  placeholder={t('outputPlaceholder')}
                />
                
                <div className="textarea-actions">
                  <Button 
                    variant="light" 
                    size="sm" 
                    className="action-btn"
                    onClick={handleSpeakOutput}
                    disabled={!outputText.trim() || outputText === t('enterTextPrompt')}
                    title={t('speakOutputText')}
                  >
                    <FiVolume2 />
                  </Button>
                  
                  <Button 
                    variant="light" 
                    size="sm" 
                    className="action-btn"
                    onClick={() => handleCopyText(outputText)}
                    disabled={!outputText.trim() || outputText === t('enterTextPrompt')}
                    title={t('copyText')}
                  >
                    {copied ? <FiCheck className="text-success" /> : <FiCopy />}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="tools-container">
              <Button 
                variant="light" 
                className="tool-btn"
                onClick={handleSpeechRecognition}
                disabled={isListening || isTranslating}
              >
                <FiMic className={isListening ? "pulsing" : ""} /> 
                {isListening ? t('listening') : t('voiceInput')}
              </Button>
              
              <Button 
                variant="light" 
                className="tool-btn"
                onClick={handleImageUpload}
                disabled={isTranslating}
              >
                <FiImage /> {t('imageTranslate')}
              </Button>
              
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleImageOCR}
              />
            </div>
          </Card.Body>
        </Card>
        
        {error && (
          <Alert variant="danger" className="mt-3">
            <FiX className="me-2" />
            {error}
          </Alert>
        )}
        
        <div className="footer">
          <p>© {new Date().getFullYear()} Py-Translate Web</p>
        </div>
      </Container>
    </>
  );
};

export default App; 