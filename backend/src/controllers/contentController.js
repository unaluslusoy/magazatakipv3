const contentService = require('../services/contentService');
const { successResponse, errorResponse, paginationResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Content Controller
 * İçerik yönetimi endpoint'leri
 */
class ContentController {
    /**
     * GET /api/contents
     * Tüm içerikleri listele
     */
    async getAllContents(req, res) {
        try {
            const filters = {
                type: req.query.type,
                status: req.query.status,
                created_by: req.query.created_by,
                search: req.query.search,
                tags: req.query.tags ? req.query.tags.split(',') : undefined
            };

            const pagination = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20
            };

            const result = await contentService.getAllContents(filters, pagination);

            return paginationResponse(res, {
                data: result.contents,
                pagination: result.pagination
            });
        } catch (error) {
            logger.error('Get all contents controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * GET /api/contents/:id
     * Tek içerik detayı
     */
    async getContentById(req, res) {
        try {
            const { id } = req.params;
            const content = await contentService.getContentById(id);

            return successResponse(res, { content });
        } catch (error) {
            logger.error('Get content by ID controller error:', error);
            return errorResponse(res, error.message, 404);
        }
    }

    /**
     * POST /api/contents
     * Yeni içerik oluştur
     */
    async createContent(req, res) {
        try {
            const content = await contentService.createContent(req.body, req.user.userId);

            return successResponse(res, {
                message: 'İçerik başarıyla oluşturuldu',
                content
            }, 201);
        } catch (error) {
            logger.error('Create content controller error:', error);
            return errorResponse(res, error.message, 400);
        }
    }

    /**
     * PUT /api/contents/:id
     * İçerik güncelle
     */
    async updateContent(req, res) {
        try {
            const { id } = req.params;
            const content = await contentService.updateContent(id, req.body);

            return successResponse(res, {
                message: 'İçerik başarıyla güncellendi',
                content
            });
        } catch (error) {
            logger.error('Update content controller error:', error);
            return errorResponse(res, error.message, 400);
        }
    }

    /**
     * DELETE /api/contents/:id
     * İçerik sil
     */
    async deleteContent(req, res) {
        try {
            const { id } = req.params;
            const result = await contentService.deleteContent(id);

            return successResponse(res, result);
        } catch (error) {
            logger.error('Delete content controller error:', error);
            return errorResponse(res, error.message, 404);
        }
    }

    /**
     * GET /api/contents/stats
     * İçerik istatistikleri
     */
    async getContentStats(req, res) {
        try {
            const stats = await contentService.getContentStats();

            return successResponse(res, { stats });
        } catch (error) {
            logger.error('Get content stats controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * POST /api/contents/slider
     * Slider oluştur
     */
    async createSlider(req, res) {
        try {
            const { name, description, slides, settings } = req.body;

            const sliderData = {
                type: 'slider',
                title: name,
                description: description,
                metadata: {
                    slides: slides,
                    settings: settings || {
                        transition_type: 'fade',
                        show_indicators: true,
                        auto_play: true,
                        loop: true
                    }
                },
                status: 'active'
            };

            const slider = await contentService.createContent(sliderData, req.user.userId);

            return successResponse(res, {
                message: 'Slider başarıyla oluşturuldu',
                content: slider
            }, 201);
        } catch (error) {
            logger.error('Create slider controller error:', error);
            return errorResponse(res, error.message, 400);
        }
    }

    /**
     * PUT /api/contents/slider/:id
     * Slider güncelle
     */
    async updateSlider(req, res) {
        try {
            const { id } = req.params;
            const { name, description, slides, settings } = req.body;

            const updateData = {
                title: name,
                description: description,
                metadata: {
                    slides: slides,
                    settings: settings
                }
            };

            const slider = await contentService.updateContent(id, updateData);

            return successResponse(res, {
                message: 'Slider başarıyla güncellendi',
                content: slider
            });
        } catch (error) {
            logger.error('Update slider controller error:', error);
            return errorResponse(res, error.message, 400);
        }
    }

    /**
     * POST /api/contents/ticker
     * Ticker oluştur
     */
    async createTicker(req, res) {
        try {
            const { name, text, settings } = req.body;

            const tickerData = {
                type: 'ticker',
                title: name,
                text_content: text,
                metadata: {
                    settings: settings || {
                        speed: 'normal',
                        font_size: 28,
                        background_color: '#1E293B',
                        text_color: '#FFFFFF'
                    }
                },
                status: 'active'
            };

            const ticker = await contentService.createContent(tickerData, req.user.userId);

            return successResponse(res, {
                message: 'Ticker başarıyla oluşturuldu',
                content: ticker
            }, 201);
        } catch (error) {
            logger.error('Create ticker controller error:', error);
            return errorResponse(res, error.message, 400);
        }
    }

    /**
     * PUT /api/contents/ticker/:id
     * Ticker güncelle
     */
    async updateTicker(req, res) {
        try {
            const { id } = req.params;
            const { name, text, settings } = req.body;

            const updateData = {
                title: name,
                text_content: text,
                metadata: {
                    settings: settings
                }
            };

            const ticker = await contentService.updateContent(id, updateData);

            return successResponse(res, {
                message: 'Ticker başarıyla güncellendi',
                content: ticker
            });
        } catch (error) {
            logger.error('Update ticker controller error:', error);
            return errorResponse(res, error.message, 400);
        }
    }

    /**
     * POST /api/contents/announcement
     * Duyuru oluştur
     */
    async createAnnouncement(req, res) {
        try {
            const { name, title, message, type, settings } = req.body;

            const announcementData = {
                type: 'announcement',
                title: name,
                text_content: JSON.stringify({
                    title: title,
                    message: message,
                    announcement_type: type || 'info'
                }),
                metadata: {
                    announcement_type: type || 'info',
                    settings: settings || {
                        duration_seconds: 10,
                        icon: 'info'
                    }
                },
                status: 'active'
            };

            const announcement = await contentService.createContent(announcementData, req.user.userId);

            return successResponse(res, {
                message: 'Duyuru başarıyla oluşturuldu',
                content: announcement
            }, 201);
        } catch (error) {
            logger.error('Create announcement controller error:', error);
            return errorResponse(res, error.message, 400);
        }
    }

    /**
     * PUT /api/contents/announcement/:id
     * Duyuru güncelle
     */
    async updateAnnouncement(req, res) {
        try {
            const { id } = req.params;
            const { name, title, message, type, settings } = req.body;

            const updateData = {
                title: name,
                text_content: JSON.stringify({
                    title: title,
                    message: message,
                    announcement_type: type
                }),
                metadata: {
                    announcement_type: type,
                    settings: settings
                }
            };

            const announcement = await contentService.updateContent(id, updateData);

            return successResponse(res, {
                message: 'Duyuru başarıyla güncellendi',
                content: announcement
            });
        } catch (error) {
            logger.error('Update announcement controller error:', error);
            return errorResponse(res, error.message, 400);
        }
    }
}

module.exports = new ContentController();