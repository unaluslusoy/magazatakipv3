const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware, authorize } = require('../middleware/auth');

/**
 * Report Routes
 * /api/reports/*
 */

/**
 * @route   GET /api/reports/dashboard
 * @desc    Dashboard özet istatistikleri
 * @access  Private
 */
router.get('/dashboard',
    authMiddleware,
    reportController.getDashboardStats
);

/**
 * @route   GET /api/reports/content-views
 * @desc    İçerik görüntülenme raporu
 * @access  Private (Admin, Manager)
 */
router.get('/content-views',
    authMiddleware,
    authorize(['super_admin', 'admin', 'manager']),
    reportController.getContentViews
);

/**
 * @route   GET /api/reports/device-uptime
 * @desc    Cihaz çalışma süresi raporu
 * @access  Private (Admin, Manager)
 */
router.get('/device-uptime',
    authMiddleware,
    authorize(['super_admin', 'admin', 'manager']),
    reportController.getDeviceUptime
);

module.exports = router;