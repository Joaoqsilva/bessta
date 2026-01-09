import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

export const LoginPage = () => {
    const navigate = useNavigate();
    const { login, googleLogin, isLoading, isAuthenticated, isAdminMaster } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Redirect authenticated users to their appropriate dashboard
    useEffect(() => {
        if (isAuthenticated) {
            if (isAdminMaster) {
                navigate('/admin/master', { replace: true });
            } else {
                navigate('/app', { replace: true });
            }
        }
    }, [isAuthenticated, isAdminMaster, navigate]);

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
                                <span className="auth-logo-text">BookMe</span>
                            </Link>
                        </div>

                        <div className="auth-content">
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
                                    <a href="#" className="auth-forgot">Esqueceu a senha?</a>
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

                            {/* Demo credentials hint */}
                            <div className="auth-demo-hint">
                                <p><strong>Modo Demo:</strong></p>
                                <p>Admin: admin@bookme.com / admin123</p>
                                <p>Ou crie uma nova conta para testar</p>
                            </div>
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
