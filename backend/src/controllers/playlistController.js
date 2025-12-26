const playlistService = require('../services/playlistService');
const { successResponse, errorResponse, paginationResponse } = require('../utils/response');
const logger = require('../utils/logger');
const socketService = require('../services/socketService');

/**
 * Playlist Controller
 * Playlist yönetimi endpoint'leri
 */
class PlaylistController {
    /**
     * GET /api/playlists
     * Tüm playlist'leri listele
     */
    async getAllPlaylists(req, res) {
        try {
            const filters = {
                is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
                is_default: req.query.is_default !== undefined ? req.query.is_default === 'true' : undefined,
                min_priority: req.query.min_priority,
                search: req.query.search
            };

            const pagination = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20
            };

            const result = await playlistService.getAllPlaylists(filters, pagination);

            return paginationResponse(res, {
                data: result.playlists,
                pagination: result.pagination
            });
        } catch (error) {
            logger.error('Get all playlists controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * GET /api/playlists/stats
     * Playlist istatistikleri
     */
    async getStats(req, res) {
        try {
            const stats = await playlistService.getPlaylistStats();
            return successResponse(res, stats, 'Playlist istatistikleri getirildi');
        } catch (error) {
            logger.error('Get playlist stats controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * GET /api/playlists/:id
     * ID ile playlist getir
     */
    async getPlaylistById(req, res) {
        try {
            const { id } = req.params;
            const includeContents = req.query.include === 'contents';

            const playlist = await playlistService.getPlaylistById(id, includeContents);
            return successResponse(res, playlist, 'Playlist getirildi');
        } catch (error) {
            logger.error('Get playlist by ID controller error:', error);
            const status = error.message === 'Playlist bulunamadı' ? 404 : 500;
            return errorResponse(res, error.message, status);
        }
    }

    /**
     * POST /api/playlists
     * Yeni playlist oluştur
     */
    async createPlaylist(req, res) {
        try {
            const userId = (req.user && req.user.userId) || (req.user && req.user.id);
            const playlist = await playlistService.createPlaylist(req.body, userId);
            return successResponse(res, playlist, 'Playlist oluşturuldu', 201);
        } catch (error) {
            logger.error('Create playlist controller error:', error);
            return errorResponse(res, error.message, 400);
        }
    }

    /**
     * PUT /api/playlists/:id
     * Playlist güncelle
     */
    async updatePlaylist(req, res) {
        try {
            const { id } = req.params;
            const playlist = await playlistService.updatePlaylist(id, req.body);

            // Notify connected devices using this playlist
            this.notifyPlaylistUpdate(id);

            return successResponse(res, playlist, 'Playlist güncellendi');
        } catch (error) {
            logger.error('Update playlist controller error:', error);
            const status = error.message === 'Playlist bulunamadı' ? 404 : 400;
            return errorResponse(res, error.message, status);
        }
    }

    /**
     * DELETE /api/playlists/:id
     * Playlist sil
     */
    async deletePlaylist(req, res) {
        try {
            const { id } = req.params;
            const result = await playlistService.deletePlaylist(id);
            return successResponse(res, result, 'Playlist silindi');
        } catch (error) {
            logger.error('Delete playlist controller error:', error);
            const status = error.message === 'Playlist bulunamadı' ? 404 : 400;
            return errorResponse(res, error.message, status);
        }
    }

    /**
     * POST /api/playlists/:id/contents
     * Playlist'e içerik ekle
     */
    async addContent(req, res) {
        try {
            const { id } = req.params;
            const { content_id, position } = req.body;

            const playlistContent = await playlistService.addContentToPlaylist(
                id,
                content_id,
                position
            );

            // Notify devices
            this.notifyPlaylistUpdate(id);

            return successResponse(res, playlistContent, 'İçerik playlist\'e eklendi', 201);
        } catch (error) {
            logger.error('Add content to playlist controller error:', error);
            const status = error.message.includes('bulunamadı') ? 404 : 400;
            return errorResponse(res, error.message, status);
        }
    }

    /**
     * DELETE /api/playlists/:id/contents/:contentId
     * Playlist'ten içerik kaldır
     */
    async removeContent(req, res) {
        try {
            const { id, contentId } = req.params;
            const result = await playlistService.removeContentFromPlaylist(id, contentId);

            // Notify devices
            this.notifyPlaylistUpdate(id);

            return successResponse(res, result, 'İçerik kaldırıldı');
        } catch (error) {
            logger.error('Remove content from playlist controller error:', error);
            const status = error.message.includes('bulunamadı') ? 404 : 400;
            return errorResponse(res, error.message, status);
        }
    }

    /**
     * PUT /api/playlists/:id/reorder
     * Playlist içerik sırasını değiştir
     */
    async reorderContents(req, res) {
        try {
            const { id } = req.params;
            const { content_ids } = req.body;

            if (!Array.isArray(content_ids)) {
                return errorResponse(res, 'content_ids bir dizi olmalıdır', 400);
            }

            const result = await playlistService.reorderPlaylistContents(id, content_ids);
            return successResponse(res, result, 'İçerik sıralaması güncellendi');
        } catch (error) {
            logger.error('Reorder playlist contents controller error:', error);
            const status = error.message === 'Playlist bulunamadı' ? 404 : 400;
            return errorResponse(res, error.message, status);
        }
    }

    /**
     * Helper: Notify devices about playlist update
     */
    async notifyPlaylistUpdate(playlistId) {
        try {
            const Device = require('../models/Device');
            const devices = await Device.findAll({
                where: { playlist_id: playlistId, status: 'online' }
            });

            for (const device of devices) {
                if (socketService.isDeviceConnected(device.device_code)) {
                    socketService.notifyPlaylistUpdate(device.device_code, playlistId);
                }
            }

            logger.info(`Playlist ${playlistId} update notifications sent to ${devices.length} device(s)`);
        } catch (error) {
            logger.error(`Error notifying playlist update: ${error.message}`);
        }
    }

    /**
     * GET /api/playlists/:id/contents
     * Playlist içeriklerini getir
     */
    async getPlaylistContents(req, res) {
        try {
            const { id } = req.params;
            const playlist = await playlistService.getPlaylistById(id, true);
            return successResponse(res, playlist.contents || [], 'Playlist içerikleri getirildi');
        } catch (error) {
            logger.error('Get playlist contents controller error:', error);
            const status = error.message === 'Playlist bulunamadı' ? 404 : 500;
            return errorResponse(res, error.message, status);
        }
    }
}

module.exports = new PlaylistController();