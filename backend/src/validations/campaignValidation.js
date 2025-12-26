const Joi = require('joi');

/**
 * Campaign Validation Schemas
 */

// Kampanya oluşturma
const createCampaignSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Kampanya adı en az 2 karakter olmalıdır',
        'string.max': 'Kampanya adı en fazla 100 karakter olabilir',
        'any.required': 'Kampanya adı gereklidir'
    }),
    description: Joi.string().allow('', null).optional(),
    playlist_id: Joi.number().integer().positive().allow(null).optional(),
    start_date: Joi.date().iso().required().messages({
        'any.required': 'Başlangıç tarihi gereklidir',
        'date.base': 'Geçerli bir tarih giriniz'
    }),
    end_date: Joi.date().iso().min(Joi.ref('start_date')).required().messages({
        'any.required': 'Bitiş tarihi gereklidir',
        'date.min': 'Bitiş tarihi başlangıç tarihinden önce olamaz'
    }),
    priority: Joi.number().integer().min(1).max(100).optional().messages({
        'number.min': 'Öncelik 1-100 arasında olmalıdır',
        'number.max': 'Öncelik 1-100 arasında olmalıdır'
    }),
    status: Joi.string().valid('pending', 'active', 'completed', 'cancelled').optional(),
    store_ids: Joi.array().items(
        Joi.number().integer().positive()
    ).optional().messages({
        'array.base': 'Mağaza ID\'leri bir dizi olmalıdır'
    })
});

// Kampanya güncelleme
const updateCampaignSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().allow('', null).optional(),
    playlist_id: Joi.number().integer().positive().allow(null).optional(),
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional(),
    priority: Joi.number().integer().min(1).max(100).optional(),
    status: Joi.string().valid('pending', 'active', 'completed', 'cancelled').optional(),
    store_ids: Joi.array().items(
        Joi.number().integer().positive()
    ).optional()
});

module.exports = {
    createCampaignSchema,
    updateCampaignSchema
};