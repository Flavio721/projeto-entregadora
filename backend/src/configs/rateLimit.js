import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Muitas requisições. Tente novamente em 15 minutos" },
    standardHeaders: true,
    legacyHeaders: false
});
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: "Muitas tentativas de login. Tente novamente em 15 minutos" },
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false
});
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: "Muitas tentativas de cadastro. Tente novamente em 1 hora" },
    standardHeaders: true,
    legacyHeaders: false
});
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 1000,
    message: { error: "Muitas requisições à API. Tente novamente em 1 minuto" },
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    keyGenerator: (req) => {
        // Se tiver usuário autenticado, usar ID
        if (req.user?.id) {
            return `user:${req.user.id}`;
        }
        // Senão, o express-rate-limit usa req.ip automaticamente
        // com tratamento correto de IPv6
        return undefined;
    }
});
export const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 1000,
    message: { error: "Muitas buscas. Tente novamente em 1 minuto" },
    standardHeaders: true,
    legacyHeaders: false
});
export const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // 20 uploads
    message: {
        error: 'Limite de uploads excedido. Aguarde 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // 3 tentativas
    message: {
        error: 'Muitas tentativas de recuperação. Tente novamente em 1 hora.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

export const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 500, // 500 requisições
    message: {
        error: 'Limite excedido. Aguarde 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false
});