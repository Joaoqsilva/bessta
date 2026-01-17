
import dotenv from 'dotenv';
import { IStore } from '../models/Store';

dotenv.config();

// ========================================
// EMAIL SERVICE - Using Brevo (Sendinblue) API
// ========================================

/**
 * Send email via Brevo API
 */
export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
    // Check for API key
    if (!process.env.BREVO_API_KEY) {
        console.log(`[Mock Email - No BREVO_API_KEY] To: ${to}, Subject: ${subject}`);
        // In dev, log the code if present
        if (process.env.NODE_ENV !== 'production') {
            const codeMatch = html.match(/>(\d{6})</);
            if (codeMatch) console.log(`🔐 CODE: ${codeMatch[1]}`);
        }
        return true; // Return true in dev for testing
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: process.env.EMAIL_FROM_NAME || 'Simpliagenda',
                    email: process.env.EMAIL_FROM || 'simpliagenda@gmail.com'
                },
                to: [{ email: to }],
                subject,
                htmlContent: html
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Brevo API error:', errorData);
            return false;
        }

        const data = await response.json();
        console.log('Email sent via Brevo:', data.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email via Brevo:', error);
        return false;
    }
};

export const sendEmailVerification = async (email: string, code: string, name: string) => {
    const subject = 'Verifique seu Email - Simpliagenda';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #4f46e5;">Bem-vindo ao Simpliagenda!</h2>
            </div>
            <p>Olá, <strong>${name}</strong>!</p>
            <p>Obrigado por se cadastrar. Para ativar sua conta, insira o código de verificação abaixo:</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${code}</span>
            </div>

            <p style="text-align: center; color: #6b7280;">Este código é válido por 24 horas.</p>
            <p>Se você não criou esta conta, ignore este email.</p>
            
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="font-size: 12px; color: #6b7280; text-align: center;">Simpliagenda</p>
        </div>
    `;

    return await sendEmail(email, subject, html);
};

export const sendAppointmentConfirmation = async (appointment: any, store: IStore) => {
    if (!appointment.customerEmail) return;

    const dateFormatted = new Date(appointment.date).toLocaleString('pt-BR', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'America/Sao_Paulo'
    });

    const subject = `Agendamento Confirmado - ${store.name}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #4f46e5; margin: 0;">Agendamento Confirmado!</h2>
            </div>
            
            <p>Olá, <strong>${appointment.customerName}</strong>!</p>
            <p>Seu agendamento em <strong>${store.name}</strong> foi confirmado com sucesso.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Serviço:</strong> ${appointment.serviceName}</p>
                <p style="margin: 5px 0;"><strong>Data e Hora:</strong> ${dateFormatted}</p>
                <p style="margin: 5px 0;"><strong>Preço:</strong> R$ ${appointment.servicePrice}</p>
                <p style="margin: 5px 0;"><strong>Endereço:</strong> ${store.address}</p>
            </div>

            <p>Caso precise remarcar ou cancelar, entre em contato com o estabelecimento:</p>
            <p><strong>Telefone/WhatsApp:</strong> ${store.phone}</p>
            
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="font-size: 12px; color: #6b7280; text-align: center;">Este é um email automático enviado via Simpliagenda.</p>
        </div>
    `;

    return await sendEmail(appointment.customerEmail, subject, html);
};

export const sendPasswordResetEmail = async (email: string, code: string, name: string) => {
    const subject = 'Recuperação de Senha - Simpliagenda';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #4f46e5;">Recuperação de Senha</h2>
            </div>
            <p>Olá, <strong>${name}</strong>.</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
            
            <p style="text-align: center;">Seu código de verificação é:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${code}</span>
            </div>

            <p style="text-align: center; color: #6b7280;">Este código é válido por 15 minutos.</p>
            <p>Se você não solicitou isso, pode ignorar este e-mail com segurança.</p>
            
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="font-size: 12px; color: #6b7280; text-align: center;">Simpliagenda</p>
        </div>
    `;

    return await sendEmail(email, subject, html);
};

export const sendAppointmentReminder = async (appointment: any, store: IStore) => {
    if (!appointment.customerEmail) return;

    const dateFormatted = new Date(appointment.date).toLocaleString('pt-BR', {
        timeStyle: 'short',
        timeZone: 'America/Sao_Paulo'
    });

    const subject = `Lembrete: Agendamento Hoje - ${store.name}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #4f46e5;">Lembrete de Agendamento</h2>
            
            <p>Olá, <strong>${appointment.customerName}</strong>!</p>
            <p>Lembramos que você tem um agendamento hoje em <strong>${store.name}</strong>.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0; font-size: 18px;"><strong>Horário:</strong> ${dateFormatted}</p>
                <p style="margin: 5px 0;"><strong>Serviço:</strong> ${appointment.serviceName}</p>
                <p style="margin: 5px 0;"><strong>Endereço:</strong> ${store.address}</p>
            </div>

            <p>Estamos te esperando!</p>
            
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="font-size: 12px; color: #6b7280; text-align: center;">Simpliagenda</p>
        </div>
    `;

    return await sendEmail(appointment.customerEmail, subject, html);
};
