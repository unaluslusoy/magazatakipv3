const Joi = require('joi');

/**
 * Device Validation Schemas
 */

// Cihaz oluşturma
const createDeviceSchema = Joi.object({
    device_code: Joi.string().min(3).max(50).required().messages({
        'string.min': 'Cihaz kodu en az 3 karakter olmalıdır',
        'string.max': 'Cihaz kodu en fazla 50 karakter olabilir',
        'any.required': 'Cihaz kodu gereklidir'
    }),
    name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Cihaz adı en az 2 karakter olmalıdır',
        'string.max': 'Cihaz adı en fazla 100 karakter olabilir',
        'any.required': 'Cihaz adı gereklidir'
    }),
    store_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Mağaza ID gereklidir',
        'number.positive': 'Geçerli bir mağaza ID olmalıdır'
    }),
    layout_type: Joi.string().valid('single', 'split_vertical', 'split_horizontal', 'grid_2x2', 'pip').optional(),
    orientation: Joi.string().valid('landscape', 'portrait').optional(),
    volume_level: Joi.number().integer().min(0).max(100).optional(),
    brightness_level: Joi.number().integer().min(0).max(100).optional(),
    is_active: Joi.boolean().optional()
});

// Cihaz güncelleme
const updateDeviceSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    store_id: Joi.number().integer().positive().optional(),
    current_playlist_id: Joi.number().integer().positive().allow(null).optional(),
    layout_type: Joi.string().valid('single', 'split_vertical', 'split_horizontal', 'grid_2x2', 'pip').optional(),
    orientation: Joi.string().valid('landscape', 'portrait').optional(),
    volume_level: Joi.number().integer().min(0).max(100).optional(),
    brightness_level: Joi.number().integer().min(0).max(100).optional(),
    is_active: Joi.boolean().optional()
});

// Heartbeat
const heartbeatSchema = Joi.object({
    ip_address: Joi.string().ip().optional(),
    app_version: Joi.string().max(20).optional(),
    os_version: Joi.string().max(50).optional(),
    screen_resolution: Joi.string().max(20).optional(),
    free_storage_mb: Joi.number().integer().min(0).optional()
});

// Aktivasyon
const activateDeviceSchema = Joi.object({
    device_code: Joi.string().min(3).max(50).required().messages({
        'any.required': 'Cihaz kodu gereklidir'
    }),
    activation_code: Joi.string().length(10).required().messages({
        'any.required': 'Aktivasyon kodu gereklidir',
        'string.length': 'Aktivasyon kodu 10 karakter olmalıdır'
    })
});

module.exports = {
    createDeviceSchema,
    updateDeviceSchema,
    heartbeatSchema,
    activateDeviceSchema
};