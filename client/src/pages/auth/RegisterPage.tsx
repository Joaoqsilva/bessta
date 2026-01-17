import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { GoogleLogin } from '@react-oauth/google';
import { Input } from '../../components/Input';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Store, ArrowRight, Calendar, AlertCircle, CheckCircle, ChevronDown, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatPhone } from '../../utils/formatters';
import { authService } from '../../services/auth';
import './AuthPages.css';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, googleLogin, isLoading, isAuthenticated, isAdminMaster } = useAuth();
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Email verification state
    const [showVerification, setShowVerification] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [verificationError, setVerificationError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);

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


    // Função para formatar telefone brasileiro (moved to utils/formatters)

    const updateField = (field: string, value: string) => {
        // Aplicar formatação específica por campo
        let formattedValue = value;
        if (field === 'phone') {
            formattedValue = formatPhone(value);
        }

        setFormData(prev => ({ ...prev, [field]: formattedValue }));
        // Clear field error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
        setError('');
    };

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};

        // Validação do nome da loja
        const storeName = formData.storeName.trim();
        if (!storeName) {
            newErrors.storeName = 'Nome da loja é obrigatório';
        } else if (storeName.length < 3) {
            newErrors.storeName = 'Nome da loja deve ter pelo menos 3 caracteres';
        } else if (storeName.length > 50) {
            newErrors.storeName = 'Nome da loja deve ter no máximo 50 caracteres';
        } else if (!/^[a-zA-ZÀ-ÿ0-9\s\-&'.]+$/.test(storeName)) {
            newErrors.storeName = 'Nome da loja contém caracteres inválidos';
        }

        // Validação do nome do proprietário
        const ownerName = formData.ownerName.trim();
        if (!ownerName) {
            newErrors.ownerName = 'Seu nome é obrigatório';
        } else if (ownerName.length < 3) {
            newErrors.ownerName = 'Nome deve ter pelo menos 3 caracteres';
        } else if (ownerName.length > 100) {
            newErrors.ownerName = 'Nome deve ter no máximo 100 caracteres';
        } else if (!/^[a-zA-ZÀ-ÿ\s\-'.]+$/.test(ownerName)) {
            newErrors.ownerName = 'Nome deve conter apenas letras';
        } else if (ownerName.split(' ').length < 2) {
            newErrors.ownerName = 'Digite seu nome completo (nome e sobrenome)';
        }

        // Validação do telefone (opcional mas se preenchido, deve ser válido)
        const phone = formData.phone.replace(/\D/g, '');
        if (phone && (phone.length < 10 || phone.length > 11)) {
            newErrors.phone = 'Telefone deve ter 10 ou 11 dígitos (com DDD)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};

        // Validação do email
        const email = formData.email.trim().toLowerCase();
        if (!email) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            newErrors.email = 'Digite um email válido (ex: nome@email.com)';
        } else if (email.length > 100) {
            newErrors.email = 'Email deve ter no máximo 100 caracteres';
        }

        // Validação da senha (mais rigorosa)
        const password = formData.password;
        if (!password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (password.length < 8) {
            newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
        } else if (password.length > 50) {
            newErrors.password = 'Senha deve ter no máximo 50 caracteres';
        } else if (!/[A-Z]/.test(password)) {
            newErrors.password = 'Senha deve conter pelo menos uma letra maiúscula';
        } else if (!/[a-z]/.test(password)) {
            newErrors.password = 'Senha deve conter pelo menos uma letra minúscula';
        } else if (!/[0-9]/.test(password)) {
            newErrors.password = 'Senha deve conter pelo menos um número';
        } else if (/\s/.test(password)) {
            newErrors.password = 'Senha não pode conter espaços';
        }

        // Validação da confirmação de senha
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

        if (isLoading) return;

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
        const result = await register({
            storeName: formData.storeName,
            ownerName: formData.ownerName,
            email: formData.email,
            phone: formData.phone,

            password: formData.password,
            category: formData.category,
        });

        // Check if registration requires verification
        if (result && typeof result === 'object' && 'requiresVerification' in result) {
            setVerificationEmail(formData.email);
            setShowVerification(true);
        } else if (result) {
            setSuccess(true);
            // Navigate to dashboard after success message
            setTimeout(() => {
                navigate('/app');
            }, 2000);
        } else {
            setError('Este email já está cadastrado. Tente fazer login ou use outro email.');
        }
    };

    const handleVerifyEmail = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            setVerificationError('Digite o código de 6 dígitos');
            return;
        }

        setVerificationLoading(true);
        setVerificationError('');

        try {
            const result = await authService.verifyEmail(verificationEmail, verificationCode);
            if (result.success && result.token) {
                // Store token and reload
                localStorage.setItem('token', result.token);
                setSuccess(true);
                setTimeout(() => {
                    window.location.href = '/app';
                }, 1500);
            } else {
                setVerificationError(result.error || 'Código inválido ou expirado');
            }
        } catch (err: any) {
            setVerificationError(err.response?.data?.error || 'Erro ao verificar email');
        } finally {
            setVerificationLoading(false);
        }
    };

    const handleResendCode = async () => {
        setResendLoading(true);
        try {
            await authService.resendVerification(verificationEmail);
            setVerificationError('');
            alert('Código reenviado! Verifique seu email.');
        } catch (err) {
            setVerificationError('Erro ao reenviar código');
        } finally {
            setResendLoading(false);
        }
    };

    // Show verification screen
    if (showVerification && !success) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-form-side">
                        <div className="auth-form-container">
                            <div className="auth-header">
                                <div className="auth-logo">
                                    <Calendar size={32} />
                                    <span>Simpliagenda</span>
                                </div>
                                <h1>Verifique seu Email</h1>
                                <p>Enviamos um código de 6 dígitos para <strong>{verificationEmail}</strong></p>
                            </div>

                            {verificationError && (
                                <div className="auth-error">
                                    <AlertCircle size={18} />
                                    {verificationError}
                                </div>
                            )}

                            <div className="auth-form">
                                <div className="form-group">
                                    <label>Código de Verificação</label>
                                    <Input
                                        type="text"
                                        placeholder="000000"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        leftIcon={<Mail size={18} />}
                                        maxLength={6}
                                        style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                                    />
                                </div>

                                <Button
                                    variant="primary"
                                    onClick={handleVerifyEmail}
                                    disabled={verificationLoading || verificationCode.length !== 6}
                                    fullWidth
                                >
                                    {verificationLoading ? 'Verificando...' : 'Verificar Email'}
                                </Button>

                                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={handleResendCode}
                                        disabled={resendLoading}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--color-primary)',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <RefreshCw size={16} className={resendLoading ? 'spin' : ''} />
                                        {resendLoading ? 'Reenviando...' : 'Reenviar código'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="auth-visual-side auth-visual-register">
                        <div className="auth-visual-content">
                            <h2 className="auth-visual-title">Quase lá!</h2>
                            <p className="auth-visual-subtitle">Verifique seu email para ativar sua conta</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                                <h2>Email verificado com sucesso! 🎉</h2>
                                <p>Sua loja <strong>{formData.storeName}</strong> foi ativada.</p>
                                <p className="auth-success-redirect">Redirecionando para o dashboard...</p>
                            </div>
                        </div>
                    </div>
                    <div className="auth-visual-side auth-visual-register">
                        <div className="auth-visual-content">
                            <h2 className="auth-visual-title">Bem-vindo ao Simpliagenda!</h2>
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
                                <span className="auth-logo-text">SimpliAgenda</span>
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
                                            placeholder="(47) 99139-4589"
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
                                            placeholder="Sua senha segura"
                                            leftIcon={<Lock size={18} />}
                                            value={formData.password}
                                            onChange={(e) => updateField('password', e.target.value)}
                                            error={errors.password}
                                            hint="Mínimo 8 caracteres, 1 maiúscula, 1 minúscula e 1 número"
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
                                <Link to="/ajuda">Termos de Serviço</Link> e{' '}
                                <Link to="/ajuda">Política de Privacidade</Link>.
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
                            <li>✓ Gestão de clientes</li>
                            <li>✓ Dashboard completo</li>
                            <li>✓ Relatórios de performance</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
