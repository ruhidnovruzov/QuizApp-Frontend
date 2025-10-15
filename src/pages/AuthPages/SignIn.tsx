import React, { useState, FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { post } from '../../api/service';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock } from 'lucide-react';

const SignIn: React.FC = () => {
    const { isAuthenticated, login: authLogin, loading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
                <div className="text-lg text-gray-600">Yüklənir...</div>
            </div>
        );
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        if (!email || !password) {
            setError('Zəhmət olmasa, email və şifrəni daxil edin.');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await post('/auth/login', { email, password });

            const token = response.data.token;

            if (token) {
                authLogin(token);
            } else {
                setError('Giriş uğursuz oldu. Serverdən token alınmadı.');
            }

        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Giriş zamanı xəta baş verdi. Email və ya şifrə yanlışdır.';
            setError(errorMessage);

        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            <div className="w-full max-w-md mx-4">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-10 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full">
                                <GraduationCap className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">QuizApp</h1>
                        <p className="text-blue-100 text-sm font-medium">Kibertəhlükəsizlik kafedrası</p>
                    </div>

                    {/* Form Section */}
                    <div className="px-8 py-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Hesaba daxil ol</h2>

                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Email Input */}
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

                            {/* Password Input */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Şifrə
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 px-4 rounded-lg text-sm font-semibold text-white transition-all duration-200 ${
                                    isSubmitting
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            >
                                {isSubmitting ? 'Giriş edilir...' : 'Daxil ol'}
                            </button>
                        </form>
                        {/* Forgot Password Link */}
                        <div className="mt-4 text-center">
                            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline font-medium">
                                Şifrəni unutdun?
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer Text */}
                <div className="text-center mt-6">
                    <p className="text-xs text-gray-500">
                        Təhlükəsiz giriş sistemi ilə qorunur
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
