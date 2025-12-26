const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const {
    loginSchema,
    refreshSchema,
    changePasswordSchema,
    updateProfileSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} = require('../validations/authValidation');

/**
 * Authentication Routes
 * /api/auth/*
 */

/**
 * @route   POST /api/auth/login
 * @desc    Kullanıcı girişi
 * @access  Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Kullanıcı çıkışı
 * @access  Private
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Access token yenileme
 * @access  Public
 */
router.post('/refresh', validate(refreshSchema), authController.refresh);

/**
 * @route   GET /api/auth/me
 * @desc    Mevcut kullanıcı bilgilerini getir
 * @access  Private
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

/**
 * @route   PUT /api/auth/password
 * @desc    Şifre değiştirme
 * @access  Private
 */
router.put('/password', authMiddleware, validate(changePasswordSchema), authController.changePassword);

/**
 * @route   PUT /api/auth/profile
 * @desc    Profil güncelleme
 * @access  Private
 */
router.put('/profile', authMiddleware, validate(updateProfileSchema), authController.updateProfile);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Şifre sıfırlama talebi
 * @access  Public
 */
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Şifre sıfırlama (token ile)
 * @access  Public
 */
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;