import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, ArrowLeft, Mail, Check } from 'lucide-react';
import authService from '../../services/auth.service';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
    const [formData, setFormData] = useState({
        ic_number: '',
        email: '',
        otp: '',
        new_password: '',
        confirm_password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [maskedEmail, setMaskedEmail] = useState('');

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.ic_number && !formData.email) {
            toast.error(t('forgot_password.intro_request'));
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.forgotPassword({
                ic_number: formData.ic_number || undefined,
                email: formData.email || undefined,
            });
            setMaskedEmail(response.email);
            setStep('verify');
            toast.success(t('forgot_password.msg_otp_sent'));
        } catch (error: any) {
            toast.error(error.response?.data?.error || t('common.error_load')); // Generic error or specific
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.otp.length !== 6) {
            toast.error(t('forgot_password.error_otp_length'));
            return;
        }

        setIsLoading(true);
        try {
            await authService.verifyOtp({
                ic_number: formData.ic_number || undefined,
                email: formData.email || undefined,
                otp: formData.otp,
            });
            setStep('reset');
            toast.success(t('forgot_password.msg_otp_verified'));
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'OTP tidak sah'); // Hardcoded fallback or key?
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.new_password.length < 6) {
            toast.error(t('user_auth.pass_min_length'));
            return;
        }

        if (formData.new_password !== formData.confirm_password) {
            toast.error(t('user_auth.pass_mismatch'));
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPassword({
                ic_number: formData.ic_number || undefined,
                email: formData.email || undefined,
                otp: formData.otp,
                new_password: formData.new_password,
            });
            toast.success(t('forgot_password.msg_reset_success'));
            navigate('/users');
        } catch (error: any) {
            toast.error(error.response?.data?.error || t('admin_technicians.status_error')); // Generic
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <Link
                    to="/users"
                    className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('user_auth.back_login')}
                </Link>

                <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <KeyRound className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">{t('forgot_password.title')}</h1>
                        <p className="text-gray-500 mt-1">
                            {step === 'request' && t('forgot_password.intro_request')}
                            {step === 'verify' && t('forgot_password.intro_verify', { email: maskedEmail })}
                            {step === 'reset' && t('forgot_password.intro_reset')}
                        </p>
                    </div>

                    {/* Step 1: Request OTP */}
                    {step === 'request' && (
                        <form onSubmit={handleRequestOtp} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('user_login.ic_no')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.ic_number}
                                    onChange={(e) => setFormData({ ...formData, ic_number: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                                    placeholder={t('user_login.placeholder_ic')}
                                    className="input-field"
                                    maxLength={12}
                                />
                            </div>

                            <div className="text-center text-gray-500">{t('complaint_form.or_text')}</div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('user_dashboard.label_email')}
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@example.com"
                                    className="input-field"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Mail className="w-5 h-5" />
                                        {t('forgot_password.btn_send_otp')}
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Verify OTP */}
                    {step === 'verify' && (
                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('forgot_password.label_otp')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.otp}
                                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                    placeholder={t('forgot_password.placeholder_otp')}
                                    className="input-field text-center text-2xl tracking-widest"
                                    maxLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        {t('forgot_password.btn_verify_otp')}
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 3: Reset Password */}
                    {step === 'reset' && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('user_dashboard.new_password')}
                                </label>
                                <input
                                    type="password"
                                    value={formData.new_password}
                                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                                    placeholder={t('user_auth.pass_min_length')}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('user_dashboard.confirm_password')}
                                </label>
                                <input
                                    type="password"
                                    value={formData.confirm_password}
                                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                                    placeholder={t('user_dashboard.confirm_password')}
                                    className="input-field"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <KeyRound className="w-5 h-5" />
                                        {t('forgot_password.btn_reset_pass')}
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
