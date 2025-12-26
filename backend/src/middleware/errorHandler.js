/**
 * Error Handling Middleware
 */

const logger = require('../utils/logger');
const { errorResponse } = require('../utils/response');

/**
 * 404 Not Found Handler
 */
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
    // Log error
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
    });

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(e => ({
            field: e.path,
            message: e.message
        }));

        return res.status(422).json({
            success: false,
            message: 'Validation hatası',
            error: {
                code: 422,
                message: 'Validation hatası',
                details: errors
            }
        });
    }

    // Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            success: false,
            message: 'Bu kayıt zaten mevcut',
            error: {
                code: 409,
                message: 'Duplicate entry'
            }
        });
    }

    // Sequelize foreign key constraint error
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({
            success: false,
            message: 'İlişkili kayıt mevcut',
            error: {
                code: 409,
                message: 'Foreign key constraint'
            }
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Geçersiz token',
            error: {
                code: 401,
                message: 'Invalid token'
            }
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token süresi dolmuş',
            error: {
                code: 401,
                message: 'Token expired'
            }
        });
    }

    // Multer errors (file upload)
    if (err.name === 'MulterError') {
        let message = 'Dosya yükleme hatası';

        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'Dosya boyutu çok büyük';
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            message = 'Çok fazla dosya';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Beklenmeyen dosya alanı';
        }

        return res.status(400).json({
            success: false,
            message,
            error: {
                code: 400,
                message: err.code
            }
        });
    }

    // Default error
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    return errorResponse(
        res,
        err.message || 'Sunucu hatası',
        statusCode
    );
};

module.exports = {
    notFound,
    errorHandler
};