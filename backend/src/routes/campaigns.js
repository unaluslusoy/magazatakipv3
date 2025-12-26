const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const {
    createCampaignSchema,
    updateCampaignSchema
} = require('../validations/campaignValidation');

/**
 * Campaign Routes
 */

// Stats
router.get(
    '/stats',
    authMiddleware,
    campaignController.getStats
);

// Active campaigns
router.get(
    '/active',
    authMiddleware,
    campaignController.getActiveCampaigns
);

// Upcoming campaigns
router.get(
    '/upcoming',
    authMiddleware,
    campaignController.getUpcomingCampaigns
);

// Update statuses
router.post(
    '/update-statuses',
    authMiddleware,
    campaignController.updateStatuses
);

// CRUD
router.get(
    '/',
    authMiddleware,
    campaignController.getAllCampaigns
);

router.get(
    '/:id',
    authMiddleware,
    campaignController.getCampaignById
);

router.post(
    '/',
    authMiddleware,
    validate(createCampaignSchema),
    campaignController.createCampaign
);

router.put(
    '/:id',
    authMiddleware,
    validate(updateCampaignSchema),
    campaignController.updateCampaign
);

router.delete(
    '/:id',
    authMiddleware,
    campaignController.deleteCampaign
);

module.exports = router;