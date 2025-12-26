const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const {
    createScheduleSchema,
    updateScheduleSchema
} = require('../validations/scheduleValidation');

/**
 * Schedule Routes
 */

// Timeline
router.get(
    '/timeline',
    authMiddleware,
    scheduleController.getTimeline
);

// Stats
router.get(
    '/stats',
    authMiddleware,
    scheduleController.getStats
);

// Currently active schedules
router.get(
    '/active',
    authMiddleware,
    scheduleController.getCurrentlyActive
);

// Schedules by playlist
router.get(
    '/playlist/:playlistId',
    authMiddleware,
    scheduleController.getByPlaylist
);

// CRUD
router.get(
    '/',
    authMiddleware,
    scheduleController.getAllSchedules
);

router.get(
    '/:id',
    authMiddleware,
    scheduleController.getScheduleById
);

router.post(
    '/',
    authMiddleware,
    validate(createScheduleSchema),
    scheduleController.createSchedule
);

router.put(
    '/:id',
    authMiddleware,
    validate(updateScheduleSchema),
    scheduleController.updateSchedule
);

router.delete(
    '/:id',
    authMiddleware,
    scheduleController.deleteSchedule
);

module.exports = router;