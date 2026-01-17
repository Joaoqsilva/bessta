import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth';
import './AuthPages.css';

export const LoginPage = () => {
    const navigate = useNavigate();
    const { login, googleLogin, isLoading, isAuthenticated, user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Password Recovery State
    const [view, setView] = useState<'login' | 'forgot' | 'reset'>('login');
    const [message, setMessage] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const result = await authService.forgotPassword(email);
            if (result.success) {
                setMessage(result.message || 'Código enviado para seu email.');
                setView('reset');
            } else {
                setError(result.error || 'Erro ao enviar código.');
            }
        } catch (err) {
            setError('Erro ao conectar com o servidor.');
        }
    };

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        try {
            const result = await authService.resetPassword({
                email,
                code: recoveryCode,
                newPassword
            });

            if (result.success) {
                setMessage('Senha alterada com sucesso! Faça login.');
                setView('login');
                setPassword('');
            } else {
                setError(result.error || 'Erro ao redefinir senha.');
            }
        } catch (err) {
            setError('Erro ao conectar com o servidor.');
        }
    };

    // Redirect authenticated users to their appropriate dashboard
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'admin_master') {
                navigate('/admin/master', { replace: true });
            } else if (user.role === 'store_owner') {
                navigate('/app', { replace: true });
            } else {
                // client_user and other roles go to home page
                navigate('/', { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isLoading) return;

        const success = await login(email, password);

        if (success) {
            // The useEffect above will handle the redirect based on role
        } else {
            setError('Email ou senha incorretos. Verifique suas credenciais.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Side - Form */}
                <div className="auth-form-side">
                    <div className="auth-form-container">
                        <div className="auth-header">
                            <Link to="/" className="auth-logo">
                                <div className="auth-logo-icon">
                                    <Calendar size={20} />
                                </div>
                                <span className="auth-logo-text">SimpliAgenda</span>
                            </Link>
                        </div>

                        <div className="auth-content">
                            {view === 'login' ? (
                                <>
                                    <h1 className="auth-title">Bem-vindo de volta</h1>
                                    <p className="auth-subtitle">
                                        Entre com suas credenciais para acessar sua conta
                                    </p>

                                    {error && (
                                        <div className="auth-error">
                                            <AlertCircle size={16} />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    {message && (
                                        <div className="auth-success-message p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg flex items-center gap-2">
                                            <AlertCircle size={16} />
                                            <span>{message}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="auth-form">
                                        <Input
                                            label="Email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            leftIcon={<Mail size={18} />}
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setError('');
                                            }}
                                            required
                                        />
                                        <Input
                                            label="Senha"
                                            type="password"
                                            placeholder="••••••••"
                                            leftIcon={<Lock size={18} />}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setError('');
                                            }}
                                            required
                                        />

                                        <div className="auth-options">
                                            <label className="auth-remember">
                                                <input type="checkbox" />
                                                <span>Lembrar-me</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setError('');
                                                    setMessage('');
                                                    setView('forgot');
                                                }}
                                                className="auth-forgot"
                                            >
                                                Esqueceu a senha?
                                            </button>
                                        </div>

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            fullWidth
                                            isLoading={isLoading}
                                            rightIcon={<ArrowRight size={18} />}
                                        >
                                            Entrar
                                        </Button>
                                    </form>

                                    <div className="auth-divider">
                                        <span>ou continue com</span>
                                    </div>

                                    <div className="auth-social flex justify-center">
                                        <GoogleLogin
                                            onSuccess={async (credentialResponse) => {
                                                if (credentialResponse.credential) {
                                                    const success = await googleLogin(credentialResponse.credential);
                                                    if (!success) {
                                                        setError('Falha no login com Google.');
                                                    }
                                                }
                                            }}
                                            onError={() => {
                                                setError('Login falhou');
                                            }}
                                            useOneTap
                                        />
                                    </div>

                                    <p className="auth-footer-text">
                                        Não tem uma conta?{' '}
                                        <Link to="/register" className="auth-link">Criar conta grátis</Link>
                                    </p>
                                </>
                            ) : view === 'forgot' ? (
                                <>
                                    <h1 className="auth-title">Recuperar Senha</h1>
                                    <p className="auth-subtitle">
                                        Digite seu email para receber um código de recuperação
                                    </p>

                                    {error && (
                                        <div className="auth-error">
                                            <AlertCircle size={16} />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleForgotSubmit} className="auth-form">
                                        <Input
                                            label="Email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            leftIcon={<Mail size={18} />}
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setError('');
                                            }}
                                            required
                                        />

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            fullWidth
                                            isLoading={isLoading}
                                            rightIcon={<ArrowRight size={18} />}
                                        >
                                            Enviar Código
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="lg"
                                            fullWidth
                                            onClick={() => {
                                                setError('');
                                                setMessage('');
                                                setView('login');
                                            }}
                                        >
                                            Voltar para Login
                                        </Button>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <h1 className="auth-title">Definir Nova Senha</h1>
                                    <p className="auth-subtitle">
                                        Verifique seu email e digite o código recebido
                                    </p>

                                    {error && (
                                        <div className="auth-error">
                                            <AlertCircle size={16} />
                                            <span>{error}</span>
                                        </div>
                                    )}
                                    {message && (
                                        <div className="auth-success-message p-3 mb-4 text-sm text-blue-700 bg-blue-100 rounded-lg flex items-center gap-2">
                                            <AlertCircle size={16} />
                                            <span>{message}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleResetSubmit} className="auth-form">
                                        <Input
                                            label="Código de Verificação"
                                            placeholder="ex: 123456"
                                            value={recoveryCode}
                                            onChange={(e) => setRecoveryCode(e.target.value)}
                                            required
                                            maxLength={6}
                                            className="text-center text-lg tracking-widest"
                                        />

                                        <Input
                                            label="Nova Senha"
                                            type="password"
                                            placeholder="Mínimo 6 caracteres"
                                            leftIcon={<Lock size={18} />}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />

                                        <Input
                                            label="Confirmar Senha"
                                            type="password"
                                            placeholder="Confirme a nova senha"
                                            leftIcon={<Lock size={18} />}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            fullWidth
                                            isLoading={isLoading}
                                        >
                                            Redefinir Senha
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="lg"
                                            fullWidth
                                            onClick={() => {
                                                setError('');
                                                setMessage('');
                                                setView('login');
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side - Visual */}
                <div className="auth-visual-side">
                    <div className="auth-visual-content">
                        <div className="auth-visual-badge">
                            ✨ Mais de 15.000 profissionais confiam em nós
                        </div>
                        <h2 className="auth-visual-title">
                            Simplifique seus agendamentos
                        </h2>
                        <p className="auth-visual-description">
                            Automatize seu negócio e tenha mais tempo para o que realmente importa.
                        </p>

                        <div className="auth-visual-stats">
                            <div className="auth-visual-stat">
                                <span className="stat-value">500k+</span>
                                <span className="stat-label">Agendamentos/mês</span>
                            </div>
                            <div className="auth-visual-stat">
                                <span className="stat-value">4.9★</span>
                                <span className="stat-label">Avaliação</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
