const Joi = require('joi');

/**
 * Store Validation Schemas
 * Veritabanı şemasına tam uyumlu
 */

// Mağaza oluşturma
const createStoreSchema = Joi.object({
    code: Joi.string().min(2).max(20).required().messages({
        'string.min': 'Mağaza kodu en az 2 karakter olmalıdır',
        'string.max': 'Mağaza kodu en fazla 20 karakter olabilir',
        'any.required': 'Mağaza kodu gereklidir'
    }),
    name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Mağaza adı en az 2 karakter olmalıdır',
        'string.max': 'Mağaza adı en fazla 100 karakter olabilir',
        'any.required': 'Mağaza adı gereklidir'
    }),
    address: Joi.string().allow(null, '').optional(),
    city: Joi.string().max(50).allow(null, '').optional(),
    region: Joi.string().max(50).allow(null, '').optional(),
    phone: Joi.string().max(20).allow(null, '').optional(),
    email: Joi.string().email().max(100).allow(null, '').optional(),
    manager_name: Joi.string().max(100).allow(null, '').optional(),
    is_active: Joi.boolean().optional()
});

// Mağaza güncelleme
const updateStoreSchema = Joi.object({
    code: Joi.string().min(2).max(20).optional(),
    name: Joi.string().min(2).max(100).optional(),
    address: Joi.string().allow(null, '').optional(),
    city: Joi.string().max(50).allow(null, '').optional(),
    region: Joi.string().max(50).allow(null, '').optional(),
    phone: Joi.string().max(20).allow(null, '').optional(),
    email: Joi.string().email().max(100).allow(null, '').optional(),
    manager_name: Joi.string().max(100).allow(null, '').optional(),
    is_active: Joi.boolean().optional()
});

module.exports = {
    createStoreSchema,
    updateStoreSchema
};