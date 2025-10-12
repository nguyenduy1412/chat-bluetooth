
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';

export interface SupportedLanguage  {
  code: string;
  label: string;
};

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    code: 'en',
    label: 'English',
  },
  {
    code: 'es-419',
    label: 'Spanish - Latin America',
  },
  {
    code: 'fr',
    label: 'French',
  },
  {
    code: 'zh-Hans',
    label: 'Simplified Chinese',
  },
  {
    code: 'ar',
    label: 'Arabic',
  },
  {
    code: 'pt-BR',
    label: 'Portuguese - Brazil',
  },
  {
    code: 'de',
    label: 'German',
  },
  {
    code: 'ru',
    label: 'Russian',
  },
  {
    code: 'ja',
    label: 'Japanese',
  },
  {
    code: 'ko',
    label: 'Korean',
  },
  {
    code: 'it',
    label: 'Italian',
  },
  {
    code: 'tr',
    label: 'Turkish',
  },
  {
    code: 'th',
    label: 'Thai',
  },
  {
    code: 'id',
    label: 'Indonesian',
  },
  {
    code: 'vi',
    label: 'Vietnamese',
  },
  {
    code: 'hi',
    label: 'Hindi',
  }
];

const initI18n = () => {
  i18n.use(initReactI18next).init({
    fallbackLng: 'en',
    debug: true,
    resources: {
      en: {
        translation: en,
      },
    },
  });
};

export default initI18n;
