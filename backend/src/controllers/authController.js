const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Authentication Controller
 * Kimlik doğrulama endpoint'lerini yönetir
 */
class AuthController {
    /**
     * POST /api/auth/login
     * Kullanıcı girişi
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Validasyon
            if (!email || !password) {
                return errorResponse(res, 'Email ve şifre gereklidir', 400);
            }

            // Login işlemi
            const result = await authService.login(email, password);

            // Cookie'ye refresh token kaydet (HttpOnly, Secure)
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 gün
            });

            return successResponse(res, {
                message: 'Giriş başarılı',
                user: result.user,
                accessToken: result.accessToken
            });
        } catch (error) {
            logger.error('Login controller error:', error);
            return errorResponse(res, error.message, 401);
        }
    }

    /**
     * POST /api/auth/logout
     * Kullanıcı çıkışı
     */
    async logout(req, res, next) {
        try {
            // Refresh token cookie'sini sil
            res.clearCookie('refreshToken');

            logger.info(`User logged out: ${req.user.email}`);

            return successResponse(res, {
                message: 'Çıkış başarılı'
            });
        } catch (error) {
            logger.error('Logout controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * POST /api/auth/refresh
     * Access token yenileme
     */
    async refresh(req, res, next) {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

            if (!refreshToken) {
                return errorResponse(res, 'Refresh token gereklidir', 401);
            }

            // Token yenileme
            const result = await authService.refreshAccessToken(refreshToken);

            // Yeni refresh token'ı cookie'ye kaydet
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            return successResponse(res, {
                message: 'Token yenilendi',
                accessToken: result.accessToken
            });
        } catch (error) {
            logger.error('Refresh token controller error:', error);
            return errorResponse(res, error.message, 401);
        }
    }

    /**
     * GET /api/auth/me
     * Mevcut kullanıcı bilgilerini getir
     */
    async getCurrentUser(req, res, next) {
        try {
            logger.debug('User authenticated:', { email: req.user.email, role: req.user.role });

            const user = await authService.getCurrentUser(req.user.userId);

            return successResponse(res, {
                user
            });
        } catch (error) {
            logger.error('Get current user controller error:', error);
            return errorResponse(res, error.message, 404);
        }
    }

    /**
     * PUT /api/auth/password
     * Şifre değiştirme
     */
    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;

            // Validasyon
            if (!currentPassword || !newPassword || !confirmPassword) {
                return errorResponse(res, 'Tüm alanlar gereklidir', 400);
            }

            if (newPassword !== confirmPassword) {
                return errorResponse(res, 'Yeni şifreler eşleşmiyor', 400);
            }

            if (newPassword.length < 8) {
                return errorResponse(res, 'Şifre en az 8 karakter olmalıdır', 400);
            }

            // Şifre değiştirme
            const result = await authService.changePassword(
                req.user.userId,
                currentPassword,
                newPassword
            );

            return successResponse(res, result);
        } catch (error) {
            logger.error('Change password controller error:', error);
            return errorResponse(res, error.message, 400);
        }
    }

    /**
     * PUT /api/auth/profile
     * Profil güncelleme
     */
    async updateProfile(req, res, next) {
        try {
            const { name, avatar_url } = req.body;

            const updateData = {};
            if (name) updateData.name = name;
            if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

            const user = await authService.updateProfile(req.user.userId, updateData);

            return successResponse(res, {
                message: 'Profil güncellendi',
                user
            });
        } catch (error) {
            logger.error('Update profile controller error:', error);
            return errorResponse(res, error.message, 400);
        }
    }

    /**
     * POST /api/auth/forgot-password
     * Şifre sıfırlama talebi
     */
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;

            if (!email) {
                return errorResponse(res, 'Email adresi gereklidir', 400);
            }

            const result = await authService.requestPasswordReset(email);

            return successResponse(res, result);
        } catch (error) {
            logger.error('Forgot password controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * POST /api/auth/reset-password
     * Şifre sıfırlama (token ile)
     */
    async resetPassword(req, res, next) {
        try {
            const { resetToken, newPassword, confirmPassword } = req.body;

            // Validasyon
            if (!resetToken || !newPassword || !confirmPassword) {
                return errorResponse(res, 'Tüm alanlar gereklidir', 400);
            }

            if (newPassword !== confirmPassword) {
                return errorResponse(res, 'Şifreler eşleşmiyor', 400);
            }

            if (newPassword.length < 8) {
                return errorResponse(res, 'Şifre en az 8 karakter olmalıdır', 400);
            }

            const result = await authService.resetPassword(resetToken, newPassword);

            return successResponse(res, result);
        } catch (error) {
            logger.error('Reset password controller error:', error);
            return errorResponse(res, error.message, 400);
        }
    }

    /**
     * POST /api/auth/device-login
     * Cihaz girişi (TV/Tablet için)
     */
    async deviceLogin(req, res, next) {
        try {
            const { device_code } = req.body;

            // Validasyon
            if (!device_code) {
                return errorResponse(res, 'Cihaz kodu gereklidir', 400);
            }

            // Device login işlemi
            const result = await authService.deviceLogin(device_code);

            return successResponse(res, {
                message: 'Cihaz girişi başarılı',
                token: result.token,
                device: result.device,
                expires_at: result.expiresAt
            });
        } catch (error) {
            logger.error('Device login controller error:', error);
            return errorResponse(res, error.message, 401);
        }
    }

    /**
     * GET /api/auth/verify
     * Token doğrulama (device için)
     */
    async verifyDevice(req, res, next) {
        try {
            const device = req.device;

            return successResponse(res, {
                message: 'Token geçerli',
                device: {
                    id: device.id,
                    device_code: device.device_code,
                    device_name: device.device_name,
                    store_id: device.store_id,
                    status: device.status
                }
            });
        } catch (error) {
            logger.error('Verify device controller error:', error);
            return errorResponse(res, error.message, 401);
        }
    }
}

module.exports = new AuthController();