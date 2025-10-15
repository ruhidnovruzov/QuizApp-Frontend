import React, { useState } from 'react';
import { post } from '../../api/service';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';

const VerifyOTP: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || '';
    const [otp, setOtp] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);
        if (!otp) {
            setError('OTP kodunu daxil edin.');
            setIsSubmitting(false);
            return;
        }
        try {
            const response = await post('/auth/verify-otp', { email, otp });
            setSuccess(response.data.message || 'OTP uğurla təsdiqləndi.');
            setTimeout(() => {
                navigate('/reset-password', { state: { email, otp } });
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'OTP düzgün deyil və ya vaxtı bitib.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            <div className="w-full max-w-md mx-4">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-8 text-center">
                        <h1 className="text-2xl font-bold text-white mb-2">OTP Təsdiqlə</h1>
                        <p className="text-blue-100 text-sm font-medium">Email ünvanınıza göndərilən OTP kodunu daxil edin.</p>
                    </div>
                    <div className="px-8 py-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                    OTP kodu
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <KeyRound className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="otp"
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                                        placeholder="OTP kodunu daxil edin"
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
                                {isSubmitting ? 'Təsdiqlənir...' : 'OTP-ni Təsdiqlə'}
                            </button>
                        </form>
                        <div className="mt-4 text-center">
                            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline font-medium">
                                Geri - Emaili dəyiş
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
