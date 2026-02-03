import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Globe, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const [language, setLanguage] = useState(i18n.language || 'ms');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setLanguage(i18n.language);
    }, [i18n.language]);

    const handleSave = () => {
        setIsSaving(true);
        i18n.changeLanguage(language);

        // Save preference for specific user
        if (user?.id) {
            localStorage.setItem(`lang_${user.id}`, language);
        }

        // Also update standard key for public/global
        // localStorage.setItem('i18nextLng', language); 
        // Actually i18next does this automatically if configured.

        setTimeout(() => {
            toast.success(t('common.success_save'));
            setIsSaving(false);
        }, 500);
    };

    return (
        <AdminLayout title={t('settings.title')} breadcrumb={t('settings.title')}>
            <div className="max-w-2xl mx-auto">
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-indigo-600" />
                        {t('settings.language_title')}
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('settings.select_language')}
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setLanguage('ms')}
                                    className={`p-4 rounded-lg border-2 flex items-center justify-between transition-all ${language === 'ms'
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <span className="font-medium">Bahasa Melayu</span>
                                    {language === 'ms' && <div className="w-4 h-4 rounded-full bg-indigo-600" />}
                                </button>

                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`p-4 rounded-lg border-2 flex items-center justify-between transition-all ${language === 'en'
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <span className="font-medium">English</span>
                                    {language === 'en' && <div className="w-4 h-4 rounded-full bg-indigo-600" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {t('settings.note')}
                            </p>
                        </div>

                        <div className="pt-4 border-t flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="btn-primary flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {t('settings.save_button')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
