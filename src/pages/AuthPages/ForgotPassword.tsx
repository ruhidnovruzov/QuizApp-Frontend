import React, { useState } from 'react';
import { post } from '../../api/service';
import { Link, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);
        if (!email) {
            setError('Email ünvanını daxil edin.');
            setIsSubmitting(false);
            return;
        }
        try {
            const response = await post('/auth/forgot-password', { email });
            setSuccess(response.data.message || 'OTP kodu email ünvanınıza göndərildi.');
            // 2 saniyə sonra OTP səhifəsinə yönləndir
            setTimeout(() => {
                navigate('/verify-otp', { state: { email } });
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Xəta baş verdi. Email düzgün deyil və ya server problemi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            <div className="w-full max-w-md mx-4">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-8 text-center">
                        <h1 className="text-2xl font-bold text-white mb-2">Şifrəni Unutdun?</h1>
                        <p className="text-blue-100 text-sm font-medium">Email ünvanını daxil edin, OTP kodu göndəriləcək.</p>
                    </div>
                    <div className="px-8 py-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email ünvanı
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                                        placeholder="numune@quiz.az"
                                    />
                                </div>
                            </div>
                            {error && (
                                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
                                    {success}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 px-4 rounded-lg text-sm font-semibold text-white transition-all duration-200 ${
                                    isSubmitting
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            >
                                {isSubmitting ? 'Göndərilir...' : 'OTP Göndər'}
                            </button>
                        </form>
                        <div className="mt-4 text-center">
                            <Link to="/signin" className="text-sm text-blue-600 hover:underline font-medium">
                                Geri - Daxil ol
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
