const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwtConfig = require('../config/jwt');
const logger = require('../utils/logger');

/**
 * Authentication Service
 * Kimlik doğrulama ve yetkilendirme işlemlerini yönetir
 */
class AuthService {
    /**
     * Kullanıcı girişi
     * @param {string} email - Kullanıcı email
     * @param {string} password - Kullanıcı şifresi
     * @returns {Object} - { user, accessToken, refreshToken }
     */
    async login(email, password) {
        try {
            // Kullanıcıyı email ile bul
            const user = await User.findByEmail(email);

            if (!user) {
                logger.warn(`Login attempt failed: User not found - ${email}`);
                throw new Error('Email veya şifre hatalı');
            }

            // Aktif mi kontrol et
            if (!user.is_active) {
                logger.warn(`Login attempt failed: User inactive - ${email}`);
                throw new Error('Hesabınız aktif değil. Lütfen yöneticinize başvurun.');
            }

            // Şifre doğrulama
            const isPasswordValid = await user.validatePassword(password);

            if (!isPasswordValid) {
                logger.warn(`Login attempt failed: Invalid password - ${email}`);
                throw new Error('Email veya şifre hatalı');
            }

            // Son giriş zamanını güncelle
            await user.updateLastLogin();

            // JWT token'ları oluştur
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);

            logger.info(`User logged in successfully: ${user.email} (${user.role})`);

            return {
                user: user.toJSON(),
                accessToken,
                refreshToken
            };
        } catch (error) {
            logger.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Access Token oluştur
     * @param {Object} user - Kullanıcı objesi
     * @returns {string} - JWT token
     */
    generateAccessToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            storeId: user.store_id
        };

        return jwt.sign(payload, jwtConfig.secret, {
            expiresIn: jwtConfig.expiresIn,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        });
    }

    /**
     * Refresh Token oluştur
     * @param {Object} user - Kullanıcı objesi
     * @returns {string} - JWT refresh token
     */
    generateRefreshToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            type: 'refresh'
        };

        return jwt.sign(payload, jwtConfig.refreshSecret, {
            expiresIn: jwtConfig.refreshExpiresIn,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        });
    }

    /**
     * Refresh Token ile yeni Access Token al
     * @param {string} refreshToken - Refresh token
     * @returns {Object} - { accessToken, refreshToken }
     */
    async refreshAccessToken(refreshToken) {
        try {
            // Refresh token'ı doğrula
            const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret, {
                issuer: jwtConfig.issuer,
                audience: jwtConfig.audience
            });

            if (decoded.type !== 'refresh') {
                throw new Error('Geçersiz token tipi');
            }

            // Kullanıcıyı getir
            const user = await User.findByPk(decoded.userId);

            if (!user || !user.is_active) {
                throw new Error('Kullanıcı bulunamadı veya aktif değil');
            }

            // Yeni token'lar oluştur
            const newAccessToken = this.generateAccessToken(user);
            const newRefreshToken = this.generateRefreshToken(user);

            logger.info(`Token refreshed for user: ${user.email}`);

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            logger.error('Token refresh error:', error);
            throw new Error('Token yenileme başarısız');
        }
    }

    /**
     * Token doğrulama
     * @param {string} token - JWT token
     * @returns {Object} - Decoded token payload
     */
    verifyToken(token) {
        try {
            return jwt.verify(token, jwtConfig.secret, {
                issuer: jwtConfig.issuer,
                audience: jwtConfig.audience
            });
        } catch (error) {
            logger.error('Token verification error:', error);
            throw new Error('Geçersiz veya süresi dolmuş token');
        }
    }

    /**
     * Mevcut kullanıcı bilgilerini getir
     * @param {number} userId - Kullanıcı ID
     * @returns {Object} - Kullanıcı bilgileri
     */
    async getCurrentUser(userId) {
        try {
            const user = await User.findByPk(userId, {
                attributes: { exclude: ['password_hash'] }
            });

            if (!user || !user.is_active) {
                throw new Error('Kullanıcı bulunamadı');
            }

            return user;
        } catch (error) {
            logger.error('Get current user error:', error);
            throw error;
        }
    }

    /**
     * Şifre değiştirme
     * @param {number} userId - Kullanıcı ID
     * @param {string} currentPassword - Mevcut şifre
     * @param {string} newPassword - Yeni şifre
     */
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await User.findByPk(userId);

            if (!user) {
                throw new Error('Kullanıcı bulunamadı');
            }

            // Mevcut şifreyi doğrula
            const isPasswordValid = await user.validatePassword(currentPassword);

            if (!isPasswordValid) {
                logger.warn(`Password change failed: Invalid current password - User ID: ${userId}`);
                throw new Error('Mevcut şifre hatalı');
            }

            // Yeni şifreyi kaydet
            user.password_hash = newPassword;
            await user.save();

            logger.info(`Password changed successfully for user: ${user.email}`);

            return { message: 'Şifre başarıyla değiştirildi' };
        } catch (error) {
            logger.error('Change password error:', error);
            throw error;
        }
    }

    /**
     * Profil güncelleme
     * @param {number} userId - Kullanıcı ID
     * @param {Object} updateData - Güncellenecek veriler
     */
    async updateProfile(userId, updateData) {
        try {
            const user = await User.findByPk(userId);

            if (!user) {
                throw new Error('Kullanıcı bulunamadı');
            }

            // Güncellenebilir alanlar
            const allowedFields = ['name', 'avatar_url'];
            const updates = {};

            allowedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    updates[field] = updateData[field];
                }
            });

            // Güncelle
            await user.update(updates);

            logger.info(`Profile updated for user: ${user.email}`);

            return user.toJSON();
        } catch (error) {
            logger.error('Update profile error:', error);
            throw error;
        }
    }

    /**
     * Email ile şifre sıfırlama token'ı oluştur
     * @param {string} email - Kullanıcı email
     * @returns {string} - Reset token
     */
    async requestPasswordReset(email) {
        try {
            const user = await User.findByEmail(email);

            if (!user) {
                // Güvenlik için kullanıcı bulunamasa bile başarılı mesaj dön
                logger.warn(`Password reset requested for non-existent email: ${email}`);
                return { message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi' };
            }

            // Reset token oluştur (1 saat geçerli)
            const resetToken = jwt.sign({ userId: user.id, email: user.email, type: 'password_reset' },
                jwtConfig.secret, { expiresIn: '1h' }
            );

            // TODO: Email gönderme servisi entegrasyonu
            logger.info(`Password reset requested for user: ${user.email}`);

            return {
                message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi',
                resetToken // DEV ortamında döndürüyoruz, production'da sadece email gönder
            };
        } catch (error) {
            logger.error('Request password reset error:', error);
            throw error;
        }
    }

    /**
     * Şifre sıfırlama token'ı ile şifre değiştir
     * @param {string} resetToken - Sıfırlama token'ı
     * @param {string} newPassword - Yeni şifre
     */
    async resetPassword(resetToken, newPassword) {
        try {
            // Token'ı doğrula
            const decoded = jwt.verify(resetToken, jwtConfig.secret);

            if (decoded.type !== 'password_reset') {
                throw new Error('Geçersiz token tipi');
            }

            const user = await User.findByPk(decoded.userId);

            if (!user) {
                throw new Error('Kullanıcı bulunamadı');
            }

            // Yeni şifreyi kaydet
            user.password_hash = newPassword;
            await user.save();

            logger.info(`Password reset successfully for user: ${user.email}`);

            return { message: 'Şifreniz başarıyla sıfırlandı' };
        } catch (error) {
            logger.error('Reset password error:', error);
            throw new Error('Şifre sıfırlama başarısız. Token geçersiz veya süresi dolmuş.');
        }
    }

    /**
     * Cihaz girişi (TV/Tablet için)
     * @param {string} deviceCode - Cihaz kodu
     * @returns {Object} - { token, device, expiresAt }
     */
    async deviceLogin(deviceCode) {
        try {
            const Device = require('../models/Device');

            // Cihazı device_code ile bul
            const device = await Device.findOne({ 
                where: { device_code: deviceCode } 
            });

            if (!device) {
                logger.warn(`Device login failed: Device not found - ${deviceCode}`);
                throw new Error('Geçersiz cihaz kodu');
            }

            // Aktif mi kontrol et
            if (device.status !== 'active') {
                logger.warn(`Device login failed: Device inactive - ${deviceCode}`);
                throw new Error('Cihaz aktif değil. Lütfen yöneticinize başvurun.');
            }

            // Device token oluştur
            const token = this.generateDeviceToken(device);
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 gün

            // Son görülme zamanını güncelle
            await device.update({ 
                last_seen: new Date(),
                status: 'active'
            });

            logger.info(`Device logged in successfully: ${device.device_code} (${device.device_name})`);

            return {
                token,
                device: {
                    id: device.id,
                    device_code: device.device_code,
                    device_name: device.device_name,
                    store_id: device.store_id,
                    status: device.status
                },
                expiresAt
            };
        } catch (error) {
            logger.error('Device login error:', error);
            throw error;
        }
    }

    /**
     * Device Token oluştur
     * @param {Object} device - Device objesi
     * @returns {string} - JWT token
     */
    generateDeviceToken(device) {
        const payload = {
            deviceId: device.id,
            deviceCode: device.device_code,
            storeId: device.store_id,
            type: 'device'
        };

        return jwt.sign(payload, jwtConfig.secret, {
            expiresIn: '30d', // 30 gün
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        });
    }

    /**
     * Device Token doğrulama
     * @param {string} token - JWT token
     * @returns {Object} - Decoded token payload
     */
    async verifyDeviceToken(token) {
        try {
            const decoded = jwt.verify(token, jwtConfig.secret);

            if (decoded.type !== 'device') {
                throw new Error('Geçersiz token tipi');
            }

            const Device = require('../models/Device');
            const device = await Device.findByPk(decoded.deviceId);

            if (!device) {
                throw new Error('Cihaz bulunamadı');
            }

            if (device.status !== 'active') {
                throw new Error('Cihaz aktif değil');
            }

            return device;
        } catch (error) {
            logger.error('Device token verification error:', error);
            throw new Error('Token geçersiz veya süresi dolmuş');
        }
    }
}

module.exports = new AuthService();