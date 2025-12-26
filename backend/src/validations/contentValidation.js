const Joi = require('joi');

/**
 * Content Validation Schemas
 */

// İçerik oluşturma
const createContentSchema = Joi.object({
    name: Joi.string().min(2).max(150).required().messages({
        'string.min': 'İçerik adı en az 2 karakter olmalıdır',
        'string.max': 'İçerik adı en fazla 150 karakter olabilir',
        'any.required': 'İçerik adı gereklidir'
    }),
    description: Joi.string().allow(null, '').optional(),
    type: Joi.string().valid('video', 'image', 'slider', 'ticker', 'announcement').required().messages({
        'any.only': 'Geçersiz içerik tipi',
        'any.required': 'İçerik tipi gereklidir'
    }),
    file_url: Joi.string().uri().allow(null, '').empty('').default(null).optional(),
    thumbnail_url: Joi.string().uri().allow(null, '').empty('').default(null).optional(),
    file_size: Joi.number().integer().min(0).allow(null).optional(),
    mime_type: Joi.string().max(100).allow(null).optional(),
    duration_seconds: Joi.number().integer().min(0).allow(null).optional(),
    resolution: Joi.string().max(20).allow(null).optional(),
    slider_settings: Joi.object().allow(null).optional(),
    ticker_text: Joi.string().allow(null, '').optional(),
    ticker_settings: Joi.object().allow(null).optional(),
    announcement_title: Joi.string().max(200).allow(null, '').optional(),
    announcement_type: Joi.string().max(20).allow(null).optional(),
    announcement_settings: Joi.object().allow(null).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid('active', 'inactive', 'draft', 'archived').optional()
});

// İçerik güncelleme
const updateContentSchema = Joi.object({
    name: Joi.string().min(2).max(150).optional(),
    description: Joi.string().allow(null, '').optional(),
    type: Joi.string().valid('video', 'image', 'slider', 'ticker', 'announcement').optional(),
    file_url: Joi.string().uri().allow(null, '').empty('').default(null).optional(),
    thumbnail_url: Joi.string().uri().allow(null, '').empty('').default(null).optional(),
    file_size: Joi.number().integer().min(0).allow(null).optional(),
    mime_type: Joi.string().max(100).allow(null).optional(),
    duration_seconds: Joi.number().integer().min(0).allow(null).optional(),
    resolution: Joi.string().max(20).allow(null).optional(),
    slider_settings: Joi.object().allow(null).optional(),
    ticker_text: Joi.string().allow(null, '').optional(),
    ticker_settings: Joi.object().allow(null).optional(),
    announcement_title: Joi.string().max(200).allow(null, '').optional(),
    announcement_type: Joi.string().max(20).allow(null).optional(),
    announcement_settings: Joi.object().allow(null).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid('active', 'inactive', 'draft', 'archived').optional()
});

module.exports = {
    createContentSchema,
    updateContentSchema
};