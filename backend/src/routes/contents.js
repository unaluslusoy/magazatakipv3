const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authMiddleware, authorize } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { createContentSchema, updateContentSchema } = require('../validations/contentValidation');

/**
 * Content Routes
 * /api/contents/*
 */

/**
 * @route   GET /api/contents/stats
 * @desc    İçerik istatistikleri
 * @access  Private (Admin, Editor)
 */
router.get('/stats',
    authMiddleware,
    authorize(['super_admin', 'admin', 'editor']),
    contentController.getContentStats
);

/**
 * @route   GET /api/contents
 * @desc    Tüm içerikleri listele (filtreleme + sayfalama)
 * @access  Private
 */
router.get('/',
    authMiddleware,
    contentController.getAllContents
);

/**
 * @route   GET /api/contents/:id
 * @desc    Tek içerik detayı
 * @access  Private
 */
router.get('/:id',
    authMiddleware,
    contentController.getContentById
);

/**
 * @route   POST /api/contents
 * @desc    Yeni içerik oluştur
 * @access  Private (Admin, Editor)
 */
router.post('/',
    authMiddleware,
    authorize(['super_admin', 'admin', 'editor']),
    validate(createContentSchema),
    contentController.createContent
);

/**
 * @route   PUT /api/contents/:id
 * @desc    İçerik güncelle
 * @access  Private (Admin, Editor)
 */
router.put('/:id',
    authMiddleware,
    authorize(['super_admin', 'admin', 'editor']),
    validate(updateContentSchema),
    contentController.updateContent
);

/**
 * @route   DELETE /api/contents/:id
 * @desc    İçerik sil
 * @access  Private (Admin)
 */
router.delete('/:id',
    authMiddleware,
    authorize(['super_admin', 'admin']),
    contentController.deleteContent
);

/**
 * @route   POST /api/contents/slider
 * @desc    Slider oluştur
 * @access  Private (Admin, Editor)
 */
router.post('/slider',
    authMiddleware,
    authorize(['super_admin', 'admin', 'editor']),
    contentController.createSlider
);

/**
 * @route   PUT /api/contents/slider/:id
 * @desc    Slider güncelle
 * @access  Private (Admin, Editor)
 */
router.put('/slider/:id',
    authMiddleware,
    authorize(['super_admin', 'admin', 'editor']),
    contentController.updateSlider
);

/**
 * @route   POST /api/contents/ticker
 * @desc    Ticker oluştur
 * @access  Private (Admin, Editor)
 */
router.post('/ticker',
    authMiddleware,
    authorize(['super_admin', 'admin', 'editor']),
    contentController.createTicker
);

/**
 * @route   PUT /api/contents/ticker/:id
 * @desc    Ticker güncelle
 * @access  Private (Admin, Editor)
 */
router.put('/ticker/:id',
    authMiddleware,
    authorize(['super_admin', 'admin', 'editor']),
    contentController.updateTicker
);

/**
 * @route   POST /api/contents/announcement
 * @desc    Duyuru oluştur
 * @access  Private (Admin, Editor)
 */
router.post('/announcement',
    authMiddleware,
    authorize(['super_admin', 'admin', 'editor']),
    contentController.createAnnouncement
);

/**
 * @route   PUT /api/contents/announcement/:id
 * @desc    Duyuru güncelle
 * @access  Private (Admin, Editor)
 */
router.put('/announcement/:id',
    authMiddleware,
    authorize(['super_admin', 'admin', 'editor']),
    contentController.updateAnnouncement
);

module.exports = router;