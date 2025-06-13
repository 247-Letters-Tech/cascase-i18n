import React, { useState, useEffect } from 'react';
import { useI18nContext } from '../contexts/I18nContext';
import { i18n, ModuleName } from '@cascade-i18n/core';

interface TranslatedTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  module: ModuleName;
  keyPath: string;
  defaultValue: string;
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({ module, keyPath, defaultValue, ...props }) => {
  const { isLoading } = useI18nContext();
  const [translatedText, setTranslatedText] = useState(defaultValue);

  useEffect(() => {
    let isMounted = true;

    async function fetchTranslation() {
      if (!isLoading) {
        const text = await i18n.t(module, keyPath, defaultValue);
        if (isMounted) {
          setTranslatedText(text);
        }
      }
    }

    fetchTranslation();

    return () => {
      isMounted = false;
    };
  }, [isLoading, module, keyPath, defaultValue]);

  if (isLoading && !translatedText) {
    return <span {...props}>...</span>;
  }

  return <span {...props}>{translatedText}</span>;
}; 