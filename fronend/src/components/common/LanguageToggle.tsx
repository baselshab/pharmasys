import { useLanguage } from '@/i18n/LanguageProvider';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

const LanguageToggle = () => {
  const { locale: language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-1.5 text-sm font-medium"
    >
      <Languages className="w-4 h-4" />
      <span>{language === 'ar' ? 'EN' : 'ع'}</span>
    </Button>
  );
};

export default LanguageToggle;
