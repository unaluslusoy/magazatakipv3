/**
 * Validation Helper Utilities
 */

const Joi = require('joi');

/**
 * Validate request data with Joi schema
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            // Log validation errors for debugging
            console.log('Validation failed for:', req.originalUrl);
            console.log('Request body:', JSON.stringify(req.body, null, 2));
            console.log('Validation errors:', JSON.stringify(errors, null, 2));

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

        // Replace req.body with validated value
        req.body = value;
        next();
    };
};

/**
 * Validate query parameters
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(422).json({
                success: false,
                message: 'Query validation hatası',
                error: {
                    code: 422,
                    message: 'Query validation hatası',
                    details: errors
                }
            });
        }

        req.query = value;
        next();
    };
};

/**
 * Common validation schemas
 */
const commonSchemas = {
    id: Joi.number().integer().positive().required(),
    uuid: Joi.string().uuid().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(50).required(),
    pagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
        sort: Joi.string().default('created_at'),
        order: Joi.string().valid('asc', 'desc').default('desc')
    })
};

module.exports = {
    validate,
    validateQuery,
    commonSchemas
};