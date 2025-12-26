/**
 * Response Helper Utilities
 */

/**
 * Success response
 */
const successResponse = (res, data, message = 'İşlem başarılı', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

/**
 * Error response
 */
const errorResponse = (res, message = 'Bir hata oluştu', statusCode = 500, errors = null) => {
    const response = {
        success: false,
        message,
        error: {
            code: statusCode,
            message
        }
    };

    if (errors) {
        response.error.details = errors;
    }

    return res.status(statusCode).json(response);
};

/**
 * Validation error response
 */
const validationErrorResponse = (res, errors) => {
    return res.status(422).json({
        success: false,
        message: 'Validation hatası',
        error: {
            code: 422,
            message: 'Validation hatası',
            details: errors
        }
    });
};

/**
 * Pagination response
 */
const paginationResponse = (res, data, page, limit, total) => {
    return res.status(200).json({
        success: true,
        data: {
            items: data,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    });
};

module.exports = {
    successResponse,
    errorResponse,
    validationErrorResponse,
    paginationResponse
};