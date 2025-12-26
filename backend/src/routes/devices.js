const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const {
    createDeviceSchema,
    updateDeviceSchema,
    heartbeatSchema,
    activateDeviceSchema
} = require('../validations/deviceValidation');

/**
 * Device Routes
 */

// Stats
router.get(
    '/stats',
    authMiddleware,
    deviceController.getStats
);

// Check statuses
router.post(
    '/check-statuses',
    authMiddleware,
    deviceController.checkStatuses
);

// Activate device (no auth - public endpoint)
router.post(
    '/activate',
    validate(activateDeviceSchema),
    deviceController.activate
);

// CRUD
router.get(
    '/',
    authMiddleware,
    deviceController.getAllDevices
);

router.get(
    '/:id',
    authMiddleware,
    deviceController.getDeviceById
);

router.post(
    '/',
    authMiddleware,
    validate(createDeviceSchema),
    deviceController.createDevice
);

router.put(
    '/:id',
    authMiddleware,
    validate(updateDeviceSchema),
    deviceController.updateDevice
);

router.delete(
    '/:id',
    authMiddleware,
    deviceController.deleteDevice
);

// Heartbeat (device auth would be added later)
router.post(
    '/:deviceCode/heartbeat',
    validate(heartbeatSchema),
    deviceController.heartbeat
);

// Assign playlist
router.put(
    '/:id/playlist',
    authMiddleware,
    deviceController.assignPlaylist
);

// Device commands
router.post(
    '/:id/restart',
    authMiddleware,
    deviceController.restartDevice
);

router.post(
    '/:id/sync',
    authMiddleware,
    deviceController.syncDevice
);

module.exports = router;