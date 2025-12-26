const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const {
    createPlaylistSchema,
    updatePlaylistSchema,
    addContentSchema,
    reorderContentsSchema
} = require('../validations/playlistValidation');

/**
 * Playlist Routes
 * Tüm route'lar auth gerektirir
 */

// Stats
router.get(
    '/stats',
    authMiddleware,
    playlistController.getStats
);

// CRUD
router.get(
    '/',
    authMiddleware,
    playlistController.getAllPlaylists
);

router.get(
    '/:id',
    authMiddleware,
    playlistController.getPlaylistById
);

router.post(
    '/',
    authMiddleware,
    validate(createPlaylistSchema),
    playlistController.createPlaylist
);

router.put(
    '/:id',
    authMiddleware,
    validate(updatePlaylistSchema),
    playlistController.updatePlaylist
);

router.delete(
    '/:id',
    authMiddleware,
    playlistController.deletePlaylist
);

// Playlist Contents
router.get(
    '/:id/contents',
    authMiddleware,
    playlistController.getPlaylistContents
);

router.post(
    '/:id/contents',
    authMiddleware,
    validate(addContentSchema),
    playlistController.addContent
);

router.delete(
    '/:id/contents/:contentId',
    authMiddleware,
    playlistController.removeContent
);

router.put(
    '/:id/contents/reorder',
    authMiddleware,
    validate(reorderContentsSchema),
    playlistController.reorderContents
);

router.put(
    '/:id/reorder',
    authMiddleware,
    validate(reorderContentsSchema),
    playlistController.reorderContents
);

module.exports = router;