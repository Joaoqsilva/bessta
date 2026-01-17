// ========================================
// STRIPE-STYLE CHECKOUT COMPONENT
// Checkout Bricks Integration + License Key
// ========================================

import { useState, useEffect } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import api from '../../services/api';
import { licenseApi } from '../../services/licenseApi';
import { Check, CreditCard, QrCode, Key, Lock, AlertCircle, Copy, ArrowRight } from 'lucide-react';
import { showSuccess } from '../../utils/toast';
import './MercadoPagoCheckout.css';

// Initialize Mercado Pago with public key
const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY || 'APP_USR-a70e6694-aca8-4441-94a5-df08352c31f1';
initMercadoPago(MP_PUBLIC_KEY, { locale: 'pt-BR' });

interface Plan {
    id: string;
    name: string;
    price: number;
    features: string[];
}

interface MercadoPagoCheckoutProps {
    plan: Plan;
    onSuccess: (paymentId: string) => void;
    onError: (error: string) => void;
    onClose: () => void;
}

type PaymentTab = 'card' | 'pix' | 'license';
type CheckoutStatus = 'idle' | 'processing' | 'success' | 'error';

export default function MercadoPagoCheckout({ plan, onSuccess, onError, onClose }: MercadoPagoCheckoutProps) {
    const [activeTab, setActiveTab] = useState<PaymentTab>('card');
    const [status, setStatus] = useState<CheckoutStatus>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // License State
    const [licenseKey, setLicenseKey] = useState('');

    // PIX State
    const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string; id: string } | null>(null);

    // Reset status on tab change
    useEffect(() => {
        setErrorMessage(null);
        if (status === 'error') setStatus('idle');
    }, [activeTab]);

    // Handle card payment submission from SDK
    const handleCardSubmit = async (formData: any) => {
        setStatus('processing');
        try {
            const response = await api.post('/mercadopago/process-payment', {
                ...formData,
                planId: plan.id
            });

            if (response.data.success && response.data.status === 'approved') {
                setStatus('success');
                setTimeout(() => onSuccess(response.data.id.toString()), 2000);
            } else if (response.data.status === 'pending' || response.data.status === 'in_process') {
                // For card, pending usually means manual review or similar. Treat as success for UI flow but warn?
                // Or maybe show processing state.
                setStatus('success'); // Showing success for UX, backend handles status
                setTimeout(() => onSuccess(response.data.id.toString()), 2000);
            } else {
                setErrorMessage(response.data.status_detail || 'Pagamento não aprovado');
                setStatus('error');
            }
        } catch (err: any) {
            console.error('Payment error:', err);
            setErrorMessage(err.response?.data?.error || 'Erro ao processar pagamento');
            setStatus('error');
        }
    };

    // Handle PIX generation
    const generatePix = async () => {
        setStatus('processing');
        try {
            const userEmail = localStorage.getItem('bookme_user_email') || 'cliente@email.com';

            const response = await api.post('/mercadopago/create-pix', {
                planId: plan.id,
                payer: {
                    email: userEmail,
                    first_name: 'Cliente',
                    last_name: 'Store',
                    identification: { type: 'CPF', number: '00000000000' }
                }
            });

            if (response.data.success) {
                setPixData({
                    id: response.data.id.toString(),
                    qrCode: response.data.qr_code,
                    qrCodeBase64: response.data.qr_code_base64
                });
                setStatus('idle'); // Back to idle but showing PIX data
            } else {
                setErrorMessage('Erro ao gerar PIX');
                setStatus('error');
            }
        } catch (err: any) {
            setErrorMessage(err.response?.data?.error || 'Erro ao gerar PIX');
            setStatus('error');
        }
    };

    // Poll PIX status
    useEffect(() => {
        if (activeTab === 'pix' && pixData?.id) {
            const interval = setInterval(async () => {
                try {
                    const response = await api.get(`/mercadopago/status/${pixData.id}`);
                    if (response.data.status === 'approved') {
                        setStatus('success');
                        clearInterval(interval);
                        setTimeout(() => onSuccess(pixData.id), 2000);
                    }
                } catch (err) {
                    console.error('Status check error:', err);
                }
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [activeTab, pixData]);

    // Handle License Activation
    const handleLicenseActivation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!licenseKey.trim()) return;

        setStatus('processing');
        try {
            const response = await licenseApi.activateKey(licenseKey);
            if (response.success) {
                setStatus('success');
                setTimeout(() => onSuccess('license-activation'), 2000);
            }
        } catch (err: any) {
            setErrorMessage(err.response?.data?.error || 'Chave de ativação inválida ou expirada');
            setStatus('error');
        }
    };

    // Render Logic
    if (status === 'success') {
        return (
            <div className="mp-checkout-overlay">
                <div className="mp-checkout-modal" style={{ maxWidth: 500, minHeight: 'auto', flexDirection: 'column', padding: 40, textAlign: 'center' }}>
                    <div className="summary-check-icon" style={{ margin: '0 auto 20px', color: '#10b981', transform: 'scale(2)' }}>
                        <Check size={32} />
                    </div>
                    <h2 style={{ fontSize: 24, marginBottom: 10, color: '#0f172a' }}>Sucesso!</h2>
                    <p style={{ color: '#64748b', marginBottom: 30 }}>Seu plano {plan.name} foi ativado com sucesso.</p>
                    <div className="spinner" style={{ borderColor: '#6366f1', borderTopColor: 'transparent', margin: '0 auto' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="mp-checkout-overlay">
            <div className="mp-checkout-modal">
                <button className="mp-close-btn" onClick={onClose}>×</button>

                {/* Left Column: Summary */}
                <div className="stripe-checkout-summary">
                    <div className="summary-header">
                        <h2>Assinatura</h2>
                        <div className="summary-price">
                            R$ {plan.price.toFixed(2).replace('.', ',')} <span>/mês</span>
                        </div>
                    </div>

                    <div className="summary-features">
                        <ul>
                            <li>
                                <Check size={16} className="summary-check-icon" />
                                <span>Plano <strong>{plan.name}</strong> Completo</span>
                            </li>
                            {plan.features.map((feature, i) => (
                                <li key={i}>
                                    <Check size={16} className="summary-check-icon" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                            <li>
                                <Check size={16} className="summary-check-icon" />
                                <span>Cancele quando quiser</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Column: Payment */}
                <div className="stripe-checkout-payment">
                    <div className="payment-header">
                        <h3>Pagamento</h3>
                    </div>

                    <div className="payment-tabs">
                        <button
                            className={`payment-tab ${activeTab === 'card' ? 'active' : ''}`}
                            onClick={() => setActiveTab('card')}
                        >
                            <CreditCard size={18} />
                            Cartão
                        </button>
                        <button
                            className={`payment-tab ${activeTab === 'pix' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('pix');
                                if (!pixData) generatePix();
                            }}
                        >
                            <QrCode size={18} />
                            PIX
                        </button>
                        <button
                            className={`payment-tab ${activeTab === 'license' ? 'active' : ''}`}
                            onClick={() => setActiveTab('license')}
                        >
                            <Key size={18} />
                            Chave
                        </button>
                    </div>

                    <div className="payment-form-container">
                        {errorMessage && (
                            <div className="status-message error">
                                <AlertCircle size={20} />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        {activeTab === 'card' && (
                            <div className="card-payment-wrapper">
                                <CardPayment
                                    initialization={{ amount: plan.price }}
                                    onSubmit={handleCardSubmit}
                                    customization={{
                                        visual: {
                                            style: { theme: 'default' },
                                            hidePaymentButton: false
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {activeTab === 'pix' && (
                            <div className="pix-container">
                                {status === 'processing' ? (
                                    <div className="mp-processing" style={{ textAlign: 'center', padding: 40 }}>
                                        <div className="spinner" style={{ borderColor: '#6366f1', borderTopColor: 'transparent', margin: '0 auto 20px' }}></div>
                                        <p>Gerando QR Code...</p>
                                    </div>
                                ) : pixData ? (
                                    <>
                                        <p style={{ fontSize: 14, color: '#64748b' }}>Escaneie o QR Code abaixo com seu app de banco:</p>
                                        <div className="pix-qr-wrapper">
                                            {pixData.qrCodeBase64 && (
                                                <img
                                                    src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                                                    alt="QR Code"
                                                    className="pix-qr-img"
                                                />
                                            )}
                                        </div>
                                        <div className="pix-copy-box">
                                            <div className="pix-code-field">{pixData.qrCode}</div>
                                            <button
                                                className="pix-copy-btn"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(pixData.qrCode);
                                                    showSuccess('Copiado!');
                                                }}
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        )}

                        {activeTab === 'license' && (
                            <form onSubmit={handleLicenseActivation}>
                                <div className="stripe-input-group">
                                    <label className="stripe-label">Chave de Ativação</label>
                                    <div className="input-with-icon" style={{ position: 'relative' }}>
                                        <Key size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#94a3b8' }} />
                                        <input
                                            type="text"
                                            className="stripe-input code-input"
                                            style={{ paddingLeft: 42 }}
                                            placeholder="XXXX-XXXX-XXXX-XXXX"
                                            value={licenseKey}
                                            onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                                            required
                                        />
                                    </div>
                                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                                        Insira a chave de licença fornecida pelo administrador ou suporte.
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    className="stripe-btn-primary"
                                    disabled={status === 'processing' || !licenseKey.trim()}
                                >
                                    {status === 'processing' ? (
                                        <div className="spinner"></div>
                                    ) : (
                                        <>
                                            Ativar Plano <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="mp-security-badge">
                        <Lock size={12} />
                        Pagamento processado de forma segura e criptografada
                    </div>
                </div>
            </div>
        </div>
    );
}
