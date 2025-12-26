const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authMiddleware, authorize } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { createStoreSchema, updateStoreSchema } = require('../validations/storeValidation');

/**
 * Store Routes
 * /api/stores/*
 */

/**
 * @route   GET /api/stores/stats
 * @desc    Mağaza istatistikleri
 * @access  Private (Admin)
 */
router.get('/stats',
    authMiddleware,
    authorize(['super_admin', 'admin']),
    storeController.getStoreStats
);

/**
 * @route   GET /api/stores/cities
 * @desc    Şehir listesi
 * @access  Private
 */
router.get('/cities',
    authMiddleware,
    storeController.getCities
);

/**
 * @route   GET /api/stores
 * @desc    Tüm mağazaları listele
 * @access  Private
 */
router.get('/',
    authMiddleware,
    storeController.getAllStores
);

/**
 * @route   GET /api/stores/:id
 * @desc    Tek mağaza detayı
 * @access  Private
 */
router.get('/:id',
    authMiddleware,
    storeController.getStoreById
);

/**
 * @route   POST /api/stores
 * @desc    Yeni mağaza oluştur
 * @access  Private (Admin)
 */
router.post('/',
    authMiddleware,
    authorize(['super_admin', 'admin']),
    validate(createStoreSchema),
    storeController.createStore
);

/**
 * @route   PUT /api/stores/:id
 * @desc    Mağaza güncelle
 * @access  Private (Admin)
 */
router.put('/:id',
    authMiddleware,
    authorize(['super_admin', 'admin']),
    validate(updateStoreSchema),
    storeController.updateStore
);

/**
 * @route   DELETE /api/stores/:id
 * @desc    Mağaza sil
 * @access  Private (Super Admin)
 */
router.delete('/:id',
    authMiddleware,
    authorize(['super_admin']),
    storeController.deleteStore
);

module.exports = router;