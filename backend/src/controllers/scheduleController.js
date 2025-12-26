const scheduleService = require('../services/scheduleService');
const { successResponse, errorResponse, paginationResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Schedule Controller
 * Zamanlama yönetimi endpoint'leri
 */
class ScheduleController {
    /**
     * GET /api/schedules/timeline
     * Timeline görünümü için zamanlama verileri
     */
    async getTimeline(req, res) {
            try {
                const { date, device_id, store_id } = req.query;

                const targetDate = date || new Date().toISOString().split('T')[0];

                const timeline = await scheduleService.getTimelineData(targetDate, {
                    device_id,
                    store_id
                });

                return successResponse(res, timeline);
            } catch (error) {
                logger.error('Get timeline controller error:', error);
                return errorResponse(res, error.message, 500);
            }
        }
        /**
         * GET /api/schedules
         * Tüm zamanlamaları listele
         */
    async getAllSchedules(req, res) {
        try {
            const filters = {
                is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
                schedule_type: req.query.schedule_type,
                playlist_id: req.query.playlist_id
            };

            const pagination = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20
            };

            const result = await scheduleService.getAllSchedules(filters, pagination);

            return paginationResponse(res, {
                data: result.schedules,
                pagination: result.pagination
            });
        } catch (error) {
            logger.error('Get all schedules controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * GET /api/schedules/stats
     * Zamanlama istatistikleri
     */
    async getStats(req, res) {
        try {
            const stats = await scheduleService.getScheduleStats();
            return successResponse(res, stats, 'Zamanlama istatistikleri getirildi');
        } catch (error) {
            logger.error('Get schedule stats controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * GET /api/schedules/active
     * Şu anda aktif zamanlamalar
     */
    async getCurrentlyActive(req, res) {
        try {
            const schedules = await scheduleService.getCurrentlyActiveSchedules();
            return successResponse(res, schedules, 'Aktif zamanlamalar getirildi');
        } catch (error) {
            logger.error('Get currently active schedules controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * GET /api/schedules/playlist/:playlistId
     * Playlist için zamanlamalar
     */
    async getByPlaylist(req, res) {
        try {
            const { playlistId } = req.params;
            const schedules = await scheduleService.getSchedulesByPlaylist(playlistId);
            return successResponse(res, schedules, 'Playlist zamanlamaları getirildi');
        } catch (error) {
            logger.error('Get schedules by playlist controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * GET /api/schedules/:id
     * ID ile zamanlama getir
     */
    async getScheduleById(req, res) {
        try {
            const { id } = req.params;
            const schedule = await scheduleService.getScheduleById(id);
            return successResponse(res, schedule, 'Zamanlama getirildi');
        } catch (error) {
            logger.error('Get schedule by ID controller error:', error);
            const status = error.message === 'Zamanlama bulunamadı' ? 404 : 500;
            return errorResponse(res, error.message, status);
        }
    }

    /**
     * POST /api/schedules
     * Yeni zamanlama oluştur
     */
    async createSchedule(req, res) {
        try {
            const schedule = await scheduleService.createSchedule(req.body);
            return successResponse(res, schedule, 'Zamanlama oluşturuldu', 201);
        } catch (error) {
            logger.error('Create schedule controller error:', error);
            return errorResponse(res, error.message, 400);
        }
    }

    /**
     * PUT /api/schedules/:id
     * Zamanlama güncelle
     */
    async updateSchedule(req, res) {
        try {
            const { id } = req.params;
            const schedule = await scheduleService.updateSchedule(id, req.body);
            return successResponse(res, schedule, 'Zamanlama güncellendi');
        } catch (error) {
            logger.error('Update schedule controller error:', error);
            const status = error.message === 'Zamanlama bulunamadı' ? 404 : 400;
            return errorResponse(res, error.message, status);
        }
    }

    /**
     * DELETE /api/schedules/:id
     * Zamanlama sil
     */
    async deleteSchedule(req, res) {
        try {
            const { id } = req.params;
            const result = await scheduleService.deleteSchedule(id);
            return successResponse(res, result, 'Zamanlama silindi');
        } catch (error) {
            logger.error('Delete schedule controller error:', error);
            const status = error.message === 'Zamanlama bulunamadı' ? 404 : 400;
            return errorResponse(res, error.message, status);
        }
    }
}

module.exports = new ScheduleController();