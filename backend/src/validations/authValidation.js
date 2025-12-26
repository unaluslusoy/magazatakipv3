const Joi = require('joi');

/**
 * Authentication Validation Schemas
 * Auth endpoint'leri için Joi validation şemaları
 */

// Login şeması
const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Geçerli bir email adresi giriniz',
            'any.required': 'Email adresi gereklidir'
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.min': 'Şifre en az 6 karakter olmalıdır',
            'any.required': 'Şifre gereklidir'
        })
});

// Refresh token şeması
const refreshSchema = Joi.object({
    refreshToken: Joi.string()
        .optional()
        .messages({
            'string.base': 'Refresh token metin olmalıdır'
        })
});

// Şifre değiştirme şeması
const changePasswordSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages({
            'any.required': 'Mevcut şifre gereklidir'
        }),
    newPassword: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            'string.min': 'Yeni şifre en az 8 karakter olmalıdır',
            'string.pattern.base': 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir',
            'any.required': 'Yeni şifre gereklidir'
        }),
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Şifreler eşleşmiyor',
            'any.required': 'Şifre tekrarı gereklidir'
        })
});

// Profil güncelleme şeması
const updateProfileSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .optional()
        .messages({
            'string.min': 'İsim en az 2 karakter olmalıdır',
            'string.max': 'İsim en fazla 100 karakter olabilir'
        }),
    avatar_url: Joi.string()
        .uri()
        .allow(null, '')
        .optional()
        .messages({
            'string.uri': 'Geçerli bir URL giriniz'
        })
});

// Şifre sıfırlama talebi şeması
const forgotPasswordSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Geçerli bir email adresi giriniz',
            'any.required': 'Email adresi gereklidir'
        })
});

// Şifre sıfırlama şeması
const resetPasswordSchema = Joi.object({
    resetToken: Joi.string()
        .required()
        .messages({
            'any.required': 'Reset token gereklidir'
        }),
    newPassword: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            'string.min': 'Yeni şifre en az 8 karakter olmalıdır',
            'string.pattern.base': 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir',
            'any.required': 'Yeni şifre gereklidir'
        }),
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Şifreler eşleşmiyor',
            'any.required': 'Şifre tekrarı gereklidir'
        })
});

module.exports = {
    loginSchema,
    refreshSchema,
    changePasswordSchema,
    updateProfileSchema,
    forgotPasswordSchema,
    resetPasswordSchema
};