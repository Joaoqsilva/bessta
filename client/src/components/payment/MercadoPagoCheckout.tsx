// ========================================
// MERCADO PAGO CHECKOUT COMPONENT
// Checkout Bricks Integration
// ========================================

import { useState, useEffect } from 'react';
import { initMercadoPago, CardPayment, StatusScreen } from '@mercadopago/sdk-react';
import api from '../../services/api';
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

type PaymentMethod = 'card' | 'pix' | null;
type CheckoutStep = 'select' | 'payment' | 'processing' | 'success' | 'error';

export default function MercadoPagoCheckout({ plan, onSuccess, onError, onClose }: MercadoPagoCheckoutProps) {
    const [step, setStep] = useState<CheckoutStep>('select');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Handle card payment submission
    const handleCardSubmit = async (formData: any) => {
        setStep('processing');
        try {
            const response = await api.post('/mercadopago/process-payment', {
                ...formData,
                planId: plan.id
            });

            if (response.data.success && response.data.status === 'approved') {
                setPaymentId(response.data.id.toString());
                setStep('success');
                onSuccess(response.data.id.toString());
            } else if (response.data.status === 'pending' || response.data.status === 'in_process') {
                setPaymentId(response.data.id.toString());
                setStep('processing');
            } else {
                setError(response.data.status_detail || 'Pagamento não aprovado');
                setStep('error');
                onError(response.data.status_detail || 'Pagamento não aprovado');
            }
        } catch (err: any) {
            console.error('Payment error:', err);
            setError(err.response?.data?.error || 'Erro ao processar pagamento');
            setStep('error');
            onError(err.response?.data?.error || 'Erro ao processar pagamento');
        }
    };

    // Handle PIX payment
    const handlePixPayment = async () => {
        setStep('processing');
        try {
            const userEmail = localStorage.getItem('bookme_user_email') || 'cliente@email.com';

            const response = await api.post('/mercadopago/create-pix', {
                planId: plan.id,
                payer: {
                    email: userEmail,
                    first_name: 'Cliente',
                    last_name: 'BookMe',
                    identification: {
                        type: 'CPF',
                        number: '00000000000'
                    }
                }
            });

            if (response.data.success) {
                setPaymentId(response.data.id.toString());
                setPixData({
                    qrCode: response.data.qr_code,
                    qrCodeBase64: response.data.qr_code_base64
                });
                setStep('payment');
            } else {
                setError('Erro ao gerar PIX');
                setStep('error');
            }
        } catch (err: any) {
            console.error('PIX error:', err);
            setError(err.response?.data?.error || 'Erro ao gerar PIX');
            setStep('error');
        }
    };

    // Poll PIX payment status
    useEffect(() => {
        if (paymentMethod === 'pix' && paymentId && step === 'payment') {
            const interval = setInterval(async () => {
                try {
                    const response = await api.get(`/mercadopago/status/${paymentId}`);
                    if (response.data.status === 'approved') {
                        setStep('success');
                        onSuccess(paymentId);
                        clearInterval(interval);
                    }
                } catch (err) {
                    console.error('Status check error:', err);
                }
            }, 5000); // Check every 5 seconds

            return () => clearInterval(interval);
        }
    }, [paymentMethod, paymentId, step, onSuccess]);

    // Copy PIX code to clipboard
    const copyPixCode = () => {
        if (pixData?.qrCode) {
            navigator.clipboard.writeText(pixData.qrCode);
            alert('Código PIX copiado!');
        }
    };

    return (
        <div className="mp-checkout-overlay">
            <div className="mp-checkout-modal">
                <button className="mp-close-btn" onClick={onClose}>×</button>

                {/* Header */}
                <div className="mp-checkout-header">
                    <h2>Assinar Plano {plan.name}</h2>
                    <p className="mp-plan-price">
                        R$ {plan.price.toFixed(2).replace('.', ',')}<span>/mês</span>
                    </p>
                </div>

                {/* Step: Select Payment Method */}
                {step === 'select' && (
                    <div className="mp-payment-methods">
                        <h3>Escolha a forma de pagamento</h3>

                        <button
                            className="mp-method-btn mp-method-card"
                            onClick={() => {
                                setPaymentMethod('card');
                                setStep('payment');
                            }}
                        >
                            <span className="mp-method-icon">💳</span>
                            <span className="mp-method-text">
                                <strong>Cartão de Crédito</strong>
                                <small>Até 12x sem juros</small>
                            </span>
                        </button>

                        <button
                            className="mp-method-btn mp-method-pix"
                            onClick={() => {
                                setPaymentMethod('pix');
                                handlePixPayment();
                            }}
                        >
                            <span className="mp-method-icon">📱</span>
                            <span className="mp-method-text">
                                <strong>PIX</strong>
                                <small>Aprovação instantânea</small>
                            </span>
                        </button>
                    </div>
                )}

                {/* Step: Card Payment Form */}
                {step === 'payment' && paymentMethod === 'card' && (
                    <div className="mp-card-form">
                        <button className="mp-back-btn" onClick={() => setStep('select')}>
                            ← Voltar
                        </button>
                        <CardPayment
                            initialization={{
                                amount: plan.price
                            }}
                            onSubmit={handleCardSubmit}
                            customization={{
                                paymentMethods: {
                                    maxInstallments: 12,
                                    minInstallments: 1
                                },
                                visual: {
                                    style: {
                                        theme: 'default'
                                    }
                                }
                            }}
                        />
                    </div>
                )}

                {/* Step: PIX Payment */}
                {step === 'payment' && paymentMethod === 'pix' && pixData && (
                    <div className="mp-pix-container">
                        <button className="mp-back-btn" onClick={() => setStep('select')}>
                            ← Voltar
                        </button>

                        <div className="mp-pix-qr">
                            <h3>Escaneie o QR Code</h3>
                            {pixData.qrCodeBase64 && (
                                <img
                                    src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                                    alt="QR Code PIX"
                                />
                            )}
                        </div>

                        <div className="mp-pix-code">
                            <p>Ou copie o código PIX:</p>
                            <div className="mp-pix-code-box">
                                <code>{pixData.qrCode?.substring(0, 50)}...</code>
                                <button onClick={copyPixCode}>Copiar</button>
                            </div>
                        </div>

                        <p className="mp-pix-waiting">
                            ⏳ Aguardando confirmação do pagamento...
                        </p>
                    </div>
                )}

                {/* Step: Processing */}
                {step === 'processing' && (
                    <div className="mp-processing">
                        <div className="mp-spinner"></div>
                        <p>Processando pagamento...</p>
                    </div>
                )}

                {/* Step: Success */}
                {step === 'success' && (
                    <div className="mp-success">
                        <div className="mp-success-icon">✅</div>
                        <h2>Pagamento Aprovado!</h2>
                        <p>Seu plano {plan.name} foi ativado com sucesso.</p>
                        <button className="mp-success-btn" onClick={onClose}>
                            Continuar
                        </button>
                    </div>
                )}

                {/* Step: Error */}
                {step === 'error' && (
                    <div className="mp-error">
                        <div className="mp-error-icon">❌</div>
                        <h2>Erro no Pagamento</h2>
                        <p>{error}</p>
                        <button className="mp-retry-btn" onClick={() => setStep('select')}>
                            Tentar Novamente
                        </button>
                    </div>
                )}

                {/* Security Badge */}
                <div className="mp-security-badge">
                    🔒 Pagamento seguro via Mercado Pago
                </div>
            </div>
        </div>
    );
}
