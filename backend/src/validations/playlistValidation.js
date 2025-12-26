const Joi = require('joi');

/**
 * Playlist Validation Schemas
 */

// Playlist oluşturma
const createPlaylistSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Playlist adı en az 2 karakter olmalıdır',
        'string.max': 'Playlist adı en fazla 100 karakter olabilir',
        'any.required': 'Playlist adı gereklidir'
    }),
    description: Joi.string().allow(null, '').optional(),
    priority: Joi.number().integer().min(1).max(100).optional().default(10).messages({
        'number.min': 'Öncelik en az 1 olmalıdır',
        'number.max': 'Öncelik en fazla 100 olabilir'
    }),
    is_default: Joi.boolean().optional().default(false),
    is_active: Joi.boolean().optional().default(true)
});

// Playlist güncelleme
const updatePlaylistSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().allow(null, '').optional(),
    priority: Joi.number().integer().min(1).max(100).optional(),
    is_default: Joi.boolean().optional(),
    is_active: Joi.boolean().optional()
});

// Playlist'e içerik ekleme
const addContentSchema = Joi.object({
    content_id: Joi.number().integer().positive().required().messages({
        'any.required': 'İçerik ID gereklidir',
        'number.positive': 'Geçerli bir içerik ID olmalıdır'
    }),
    position: Joi.number().integer().min(0).optional().allow(null).messages({
        'number.min': 'Pozisyon 0 veya daha büyük olmalıdır'
    }),
    duration_override: Joi.number().integer().positive().optional().allow(null),
    transition_type: Joi.string().valid('fade', 'slide', 'zoom', 'none').optional().default('fade'),
    settings: Joi.object().optional().allow(null)
});

// İçerik sıralama
const reorderContentsSchema = Joi.object({
    content_ids: Joi.array().items(
        Joi.number().integer().positive()
    ).min(1).required().messages({
        'array.min': 'En az bir içerik ID gereklidir',
        'any.required': 'İçerik ID listesi gereklidir'
    })
});

module.exports = {
    createPlaylistSchema,
    updatePlaylistSchema,
    addContentSchema,
    reorderContentsSchema
};