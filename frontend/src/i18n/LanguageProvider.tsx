import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { translations, type Locale, type TranslationKey } from "./translations";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "en",
  setLocale: () => {},
  toggleLanguage: () => {},
  t: (key) => translations[key]?.en ?? key,
  isRTL: false,
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    return (localStorage.getItem("pharma_locale") as Locale) || "en";
  });

  const isRTL = locale === "ar";

  useEffect(() => {
    const root = document.documentElement;
    root.dir = isRTL ? "rtl" : "ltr";
    root.lang = locale;
  }, [locale, isRTL]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("pharma_locale", l);
  }, []);

  const toggleLanguage = useCallback(() => {
    const newLocale: Locale = locale === "en" ? "ar" : "en";
    setLocaleState(newLocale);
    localStorage.setItem("pharma_locale", newLocale);
  }, [locale]);

  const t = useCallback((key: TranslationKey): string => {
    return translations[key]?.[locale] ?? key;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}