import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { GoogleLogin } from '@react-oauth/google';
import { Input } from '../../components/Input';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Store, ArrowRight, Calendar, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, googleLogin, isLoading, isAuthenticated, isAdminMaster } = useAuth();
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

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

    // Form data
    const [formData, setFormData] = useState({
        storeName: '',
        ownerName: '',
        email: '',
        phone: '',

        password: '',
        confirmPassword: '',
        category: 'beauty', // Default category
    });

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear field error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
        setError('');
    };

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.storeName.trim()) {
            newErrors.storeName = 'Nome da loja é obrigatório';
        } else if (formData.storeName.length < 3) {
            newErrors.storeName = 'Nome da loja deve ter pelo menos 3 caracteres';
        }

        if (!formData.ownerName.trim()) {
            newErrors.ownerName = 'Seu nome é obrigatório';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirme sua senha';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (step === 1) {
            if (validateStep1()) {
                setStep(2);
            }
            return;
        }

        if (!validateStep2()) {
            return;
        }

        // Attempt registration
        const success = await register({
            storeName: formData.storeName,
            ownerName: formData.ownerName,
            email: formData.email,
            phone: formData.phone,

            password: formData.password,
            category: formData.category,
        });

        if (success) {
            setSuccess(true);
            // Navigate to dashboard after success message
            setTimeout(() => {
                navigate('/app');
            }, 2000);
        } else {
            setError('Este email já está cadastrado. Tente fazer login ou use outro email.');
        }
    };

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-form-side">
                        <div className="auth-form-container">
                            <div className="auth-success-message">
                                <div className="auth-success-icon">
                                    <CheckCircle size={48} />
                                </div>
                                <h2>Conta criada com sucesso! 🎉</h2>
                                <p>Sua loja <strong>{formData.storeName}</strong> foi criada.</p>
                                <p className="auth-success-redirect">Redirecionando para o dashboard...</p>
                            </div>
                        </div>
                    </div>
                    <div className="auth-visual-side auth-visual-register">
                        <div className="auth-visual-content">
                            <h2 className="auth-visual-title">Bem-vindo ao Bessta!</h2>
                            <p className="auth-visual-description">
                                Sua jornada para simplificar agendamentos começa agora.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                                <span className="auth-logo-text">Bessta</span>
                            </Link>
                        </div>

                        <div className="auth-content">
                            <h1 className="auth-title">Crie sua conta</h1>
                            <p className="auth-subtitle">
                                {step === 1
                                    ? 'Configure seu perfil de loja para começar'
                                    : 'Finalize com suas credenciais de acesso'
                                }
                            </p>

                            {/* Progress Steps */}
                            <div className="auth-steps">
                                <div className={`auth-step ${step >= 1 ? 'active' : ''}`}>
                                    <div className="auth-step-number">1</div>
                                    <span>Sua Loja</span>
                                </div>
                                <div className="auth-step-line" />
                                <div className={`auth-step ${step >= 2 ? 'active' : ''}`}>
                                    <div className="auth-step-number">2</div>
                                    <span>Credenciais</span>
                                </div>
                            </div>

                            {error && (
                                <div className="auth-error">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="auth-form">
                                {step === 1 ? (
                                    <>
                                        <Input
                                            label="Nome da Loja"
                                            type="text"
                                            placeholder="Ex: Barbearia do João"
                                            leftIcon={<Store size={18} />}
                                            value={formData.storeName}
                                            onChange={(e) => updateField('storeName', e.target.value)}
                                            error={errors.storeName}
                                            required
                                        />


                                        <Input
                                            label="Seu Nome"
                                            type="text"
                                            placeholder="Nome completo"
                                            leftIcon={<User size={18} />}
                                            value={formData.ownerName}
                                            onChange={(e) => updateField('ownerName', e.target.value)}
                                            error={errors.ownerName}
                                            required
                                        />
                                        <Input
                                            label="Telefone"
                                            type="tel"
                                            placeholder="(11) 99999-9999"
                                            leftIcon={<Phone size={18} />}
                                            value={formData.phone}
                                            onChange={(e) => updateField('phone', e.target.value)}
                                            hint="Usaremos para notificações importantes"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Input
                                            label="Email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            leftIcon={<Mail size={18} />}
                                            value={formData.email}
                                            onChange={(e) => updateField('email', e.target.value)}
                                            error={errors.email}
                                            required
                                        />
                                        <Input
                                            label="Senha"
                                            type="password"
                                            placeholder="Mínimo 6 caracteres"
                                            leftIcon={<Lock size={18} />}
                                            value={formData.password}
                                            onChange={(e) => updateField('password', e.target.value)}
                                            error={errors.password}
                                            required
                                        />
                                        <Input
                                            label="Confirmar Senha"
                                            type="password"
                                            placeholder="Repita a senha"
                                            leftIcon={<Lock size={18} />}
                                            value={formData.confirmPassword}
                                            onChange={(e) => updateField('confirmPassword', e.target.value)}
                                            error={errors.confirmPassword}
                                            required
                                        />
                                    </>
                                )}

                                <div className="auth-form-actions">
                                    {step === 2 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="lg"
                                            onClick={() => setStep(1)}
                                        >
                                            Voltar
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        fullWidth={step === 1}
                                        isLoading={isLoading}
                                        rightIcon={<ArrowRight size={18} />}
                                    >
                                        {step === 1 ? 'Continuar' : 'Criar Conta'}
                                    </Button>
                                </div>
                            </form>

                            {step === 1 && (
                                <>
                                    <div className="auth-divider">
                                        <span>ou continue com</span>
                                    </div>

                                    <div className="auth-social flex justify-center">
                                        <GoogleLogin
                                            onSuccess={async (credentialResponse) => {
                                                if (credentialResponse.credential) {
                                                    const success = await googleLogin(credentialResponse.credential);
                                                    if (!success) {
                                                        setError('Falha no cadastro com Google.');
                                                    }
                                                }
                                            }}
                                            onError={() => {
                                                setError('Cadastro com Google falhou');
                                            }}
                                            useOneTap
                                        />
                                    </div>
                                </>
                            )}

                            <p className="auth-footer-text">
                                Já tem uma conta?{' '}
                                <Link to="/login" className="auth-link">Entrar</Link>
                            </p>

                            <p className="auth-terms">
                                Ao criar uma conta, você concorda com nossos{' '}
                                <a href="#">Termos de Serviço</a> e{' '}
                                <a href="#">Política de Privacidade</a>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Visual */}
                <div className="auth-visual-side auth-visual-register">
                    <div className="auth-visual-content">
                        <div className="auth-visual-badge">
                            🚀 Comece grátis, sem cartão de crédito
                        </div>
                        <h2 className="auth-visual-title">
                            Sua jornada começa aqui
                        </h2>
                        <p className="auth-visual-description">
                            Crie sua página de agendamentos em menos de 5 minutos e comece a receber clientes.
                        </p>

                        <ul className="auth-visual-features">
                            <li>✓ Agendamento online 24/7</li>
                            <li>✓ Lembretes automáticos</li>
                            <li>✓ Dashboard completo</li>
                            <li>✓ Relatórios de performance</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
