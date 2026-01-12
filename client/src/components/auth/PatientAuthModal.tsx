import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth';

interface PatientAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    storeId: string;
    storeName?: string;
}

export const PatientAuthModal = ({ isOpen, onClose, storeId, storeName }: PatientAuthModalProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth(); // Assuming login is available in AuthContext

    // Fallback URL if env var is missing
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                // Login Flow
                await login(formData.email, formData.password);
                onClose();
            } else {
                // Register Flow
                // Use authService to leverage centralized API configuration (baseUrl, proxy, etc.)
                const response = await authService.register({
                    role: 'client_user',
                    storeId,
                    email: formData.email,
                    password: formData.password,
                    ownerName: formData.name,
                    phone: formData.phone
                });

                if (response.success && response.token) {
                    // Register implicitly logs in (backend returns token)
                    localStorage.setItem('bookme_token', response.token);

                    // Manually refresh auth context if needed, or just login using credentials to be safe/consistent
                    // But since we have the token, we can just close.
                    // However, AuthContext state won't update unless we call login() or reload.
                    // The simplest way to sync AuthContext is to call login() which hits the API again.
                    // OR we can manually set it if we expose `setToken` but we don't.
                    // So calling login is acceptable overhead.
                    await login(formData.email, formData.password);
                    onClose();
                } else {
                    throw new Error(response.error || 'Erro ao registrar');
                }
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            // Better error extraction for Axios errors
            const serverError = err.response?.data?.error;
            const fallbackError = err.message || 'Ocorreu um erro. Tente novamente.';
            setError(serverError || fallbackError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div
                className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="p-8 pb-0 text-center">
                    <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">
                        {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {isLogin
                            ? `Acesse sua conta para gerenciar agendamentos na ${storeName || 'clínica'}`
                            : `Cadastre-se para agendar com a ${storeName || 'clínica'}`}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 mb-4">
                            {error}
                        </div>
                    )}

                    {!isLogin && (
                        <div className="space-y-4 animate-slide-in">
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Seu Nome Completo"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--clinica-primary)] focus:border-transparent outline-none transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="tel"
                                    placeholder="Seu Whatsapp"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--clinica-primary)] focus:border-transparent outline-none transition-all"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="email"
                            placeholder="Seu E-mail"
                            required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--clinica-primary)] focus:border-transparent outline-none transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="password"
                            placeholder="Sua Senha"
                            required
                            minLength={6}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--clinica-primary)] focus:border-transparent outline-none transition-all"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-[var(--clinica-primary)] text-white rounded-xl font-medium hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-[var(--clinica-primary)]/20 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            isLogin ? 'Entrar' : 'Cadastrar'
                        )}
                    </button>
                </form>

                {/* Footer Toggle */}
                <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                    <p className="text-gray-600 text-sm">
                        {isLogin ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            className="ml-2 font-semibold text-[var(--clinica-primary)] hover:underline"
                        >
                            {isLogin ? 'Cadastre-se' : 'Entrar'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
