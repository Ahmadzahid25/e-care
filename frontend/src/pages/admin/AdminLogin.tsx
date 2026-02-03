import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth.service';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';

export default function AdminLogin() {

    const { login, isAuthenticated, role } = useAuth();
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            if (role === 'admin') {
                window.location.href = '/admin/dashboard';
            } else if (role === 'technician') {
                window.location.href = '/admin/technician/dashboard';
            }
        }
    }, [isAuthenticated, role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.username || !formData.password) {
            toast.error(t('login.error_required'));
            return;
        }

        setIsLoading(true);

        // Try admin login first
        try {
            const response = await authService.login({
                username: formData.username,
                password: formData.password,
                role: 'admin',
            });

            login(response.token, response.user, 'admin');
            toast.success(t('login.success'));
            window.location.href = '/admin/dashboard';
            return;
        } catch (adminError: any) {
            console.log('Admin login failed, trying technician...', adminError);

            // Admin login failed, try technician
            try {
                const response = await authService.login({
                    username: formData.username,
                    password: formData.password,
                    role: 'technician',
                });

                console.log('Technician login success:', response);

                login(response.token, response.user, 'technician');

                window.location.href = '/admin/technician/dashboard';

                return;
            } catch (techError: any) {
                console.log('Technician login failed:', techError);
                // Both failed - show error
                toast.error(techError.response?.data?.error || t('login.failed'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-indigo-900 flex items-center justify-center px-4 relative">
            <div className="absolute top-4 right-4 z-10">
                <LanguageSwitcher className="text-white hover:bg-white/10" />
            </div>

            <div className="w-full max-w-md">
                {/* Back button */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('login.back')}
                </Link>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <LogIn className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">{t('login.title')}</h1>
                        <p className="text-gray-500 mt-1">{t('login.subtitle')}</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                {t('login.username')}
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder={t('login.placeholder_username')}
                                className="input-field"
                                autoComplete="username"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                {t('login.password')}
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={t('login.placeholder_password')}
                                    className="input-field pr-12"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    {t('login.submit')}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <footer className="text-center text-sm text-white/60 mt-8">
                    {t('login.footer')}
                </footer>
            </div>
        </div>
    );
}
