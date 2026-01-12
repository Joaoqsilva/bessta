import { z } from 'zod';

/**
 * Validation Schemas for Auth Routes
 */

// Phone regex (simple international format allowing +, -, space)
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "Email inválido" }).max(100),
        password: z
            .string()
            .min(6, { message: "Senha deve ter pelo menos 6 caracteres" })
            .max(50),
        ownerName: z
            .string()
            .min(3, { message: "Nome deve ter pelo menos 3 caracteres" })
            .max(100)
            .regex(/^[a-zA-ZÀ-ÿ\s\-'.]+$/, { message: "Nome deve conter apenas letras" }),
        storeName: z
            .string()
            .min(3, { message: "Nome da loja deve ter pelo menos 3 caracteres" })
            .max(50)
            .optional(),
        role: z.enum(['store_owner', 'client_user']).optional(),
        storeId: z.string().optional(),
        phone: z.string().optional().or(z.literal('')), // Optional or empty string
        category: z.string().optional(),
    }).superRefine((data, ctx) => {
        if (data.role === 'client_user') {
            if (!data.storeId) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "ID da loja é obrigatório para cadastro de cliente",
                    path: ["storeId"]
                });
            }
        } else {
            // Default is store_owner
            if (!data.storeName) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Nome da loja é obrigatório para lojistas",
                    path: ["storeName"]
                });
            }
        }
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "Email inválido" }),
        password: z.string().min(1, { message: "Senha é obrigatória" }),
    }),
});

export const updateProfileSchema = z.object({
    body: z.object({
        ownerName: z
            .string()
            .min(3)
            .max(100)
            .regex(/^[a-zA-ZÀ-ÿ\s\-'.]+$/)
            .optional(),
        phone: z.string().optional(),
    }).strict(), // Strict mode: rejects unknown fields (Mass Assignment Protection)
});
