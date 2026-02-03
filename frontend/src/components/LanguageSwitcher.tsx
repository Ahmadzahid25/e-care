import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ms' : 'en';
        i18n.changeLanguage(newLang);
        // Persist globally for public
        localStorage.setItem('i18nextLng', newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 text-sm font-medium ${className}`}
            title="Tukar Bahasa / Switch Language"
        >
            <Globe className="w-4 h-4" />
            <span>{i18n.language === 'en' ? 'English' : 'B. Melayu'}</span>
        </button>
    );
}
