import React, { useState } from 'react';
import { Form, Modal, Button, InputGroup, FormControl } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { LANGUAGE_LIST } from '../types/languages';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  selectedLanguage, 
  onSelectLanguage 
}) => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleLanguageSelect = (languageName: string) => {
    onSelectLanguage(languageName);
    handleClose();
  };

  const filteredLanguages = LANGUAGE_LIST.filter(language => 
    language.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>{t('targetLanguage')}</Form.Label>
        <Button 
          variant="outline-secondary" 
          className="w-100 text-start"
          onClick={handleShow}
        >
          {selectedLanguage}
        </Button>
      </Form.Group>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{t('selectLanguage')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text>{t('searchLanguage')}</InputGroup.Text>
            <FormControl
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchLanguage')}
            />
          </InputGroup>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {filteredLanguages.map((language) => (
              <Button
                key={language.code}
                variant="outline-primary"
                className="w-100 text-start mb-2"
                onClick={() => handleLanguageSelect(language.name)}
              >
                {language.name}
              </Button>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default LanguageSelector; 