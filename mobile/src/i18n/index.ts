/**
 * AgriRaksha AI — i18n Configuration
 * 
 * Supports: English, Hindi, Marathi
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import hi from './hi.json';
import mr from './mr.json';
import te from './te.json';

export const languageResources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
  te: { translation: te },
};

i18n
  .use(initReactI18next)
  .init({
    resources: languageResources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  });

export default i18n;
