const Joi = require('joi');

/**
 * Schedule Validation Schemas
 */

// Zamanlama oluşturma
const createScheduleSchema = Joi.object({
    playlist_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Playlist ID gereklidir',
        'number.positive': 'Geçerli bir playlist ID olmalıdır'
    }),
    schedule_type: Joi.string().valid('always', 'date_range', 'daily', 'weekly', 'custom').required().messages({
        'any.required': 'Zamanlama tipi gereklidir',
        'any.only': 'Geçerli bir zamanlama tipi seçilmelidir'
    }),
    start_date: Joi.date().iso().optional().allow(null),
    end_date: Joi.date().iso().min(Joi.ref('start_date')).optional().allow(null).messages({
        'date.min': 'Bitiş tarihi başlangıç tarihinden önce olamaz'
    }),
    start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).optional().allow(null).messages({
        'string.pattern.base': 'Geçerli bir saat formatı giriniz (HH:MM veya HH:MM:SS)'
    }),
    end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).optional().allow(null).messages({
        'string.pattern.base': 'Geçerli bir saat formatı giriniz (HH:MM veya HH:MM:SS)'
    }),
    days_of_week: Joi.array().items(
        Joi.number().integer().min(1).max(7)
    ).optional().allow(null).messages({
        'array.base': 'Günler bir dizi olmalıdır',
        'number.min': 'Gün değeri 1-7 arasında olmalıdır',
        'number.max': 'Gün değeri 1-7 arasında olmalıdır'
    }),
    is_active: Joi.boolean().optional()
});

// Zamanlama güncelleme
const updateScheduleSchema = Joi.object({
    playlist_id: Joi.number().integer().positive().optional(),
    schedule_type: Joi.string().valid('always', 'date_range', 'daily', 'weekly', 'custom').optional(),
    start_date: Joi.date().iso().optional().allow(null),
    end_date: Joi.date().iso().optional().allow(null),
    start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).optional().allow(null),
    end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).optional().allow(null),
    days_of_week: Joi.array().items(
        Joi.number().integer().min(1).max(7)
    ).optional().allow(null),
    is_active: Joi.boolean().optional()
});

module.exports = {
    createScheduleSchema,
    updateScheduleSchema
};