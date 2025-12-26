/**
 * Authentication Middleware
 */

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Verify JWT Token
 */
const authMiddleware = async(req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 'Token bulunamadı', 401);
        }

        const token = authHeader.substring(7); // Remove 'Bearer '

        if (!token) {
            return errorResponse(res, 'Token bulunamadı', 401);
        }

        // Verify token
        const decoded = jwt.verify(token, jwtConfig.secret, {
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        });

        // Attach user to request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            storeId: decoded.storeId
        };

        logger.debug('User authenticated:', {
            email: req.user.email,
            role: req.user.role
        });

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return errorResponse(res, 'Token süresi dolmuş', 401);
        }

        if (error.name === 'JsonWebTokenError') {
            return errorResponse(res, 'Geçersiz token', 401);
        }

        logger.error('Auth middleware error:', error);
        return errorResponse(res, 'Kimlik doğrulama hatası', 401);
    }
};

/**
 * Role-based access control
 */
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 'Kimlik doğrulama gerekli', 401);
        }

        // roles can be array or single string
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(req.user.role)) {
            logger.warn('Unauthorized access attempt:', {
                userId: req.user.userId,
                userRole: req.user.role,
                requiredRoles: allowedRoles,
                url: req.originalUrl
            });

            return errorResponse(res, 'Bu işlem için yetkiniz yok', 403);
        }

        next();
    };
};

/**
 * Optional authentication (doesn't fail if no token)
 */
const optionalAuth = async(req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);

            const decoded = jwt.verify(token, jwtConfig.secret, {
                issuer: jwtConfig.issuer,
                audience: jwtConfig.audience
            });
            userId: decoded.userI

            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                storeId: decoded.storeId
            };
        }
    } catch (error) {
        // Ignore errors in optional auth
        logger.debug('Optional auth failed:', error.message);
    }

    next();
};

module.exports = {
    authMiddleware,
    authorize,
    optionalAuth
};