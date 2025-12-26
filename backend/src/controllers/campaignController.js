const campaignService = require('../services/campaignService');
const { successResponse, errorResponse, paginationResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Campaign Controller
 * Kampanya yönetimi endpoint'leri
 */
class CampaignController {
    /**
     * GET /api/campaigns
     * Tüm kampanyaları listele
     */
    async getAllCampaigns(req, res) {
        try {
            const filters = {
                status: req.query.status,
                search: req.query.search,
                start_date: req.query.start_date,
                end_date: req.query.end_date
            };

            const pagination = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20
            };

            const result = await campaignService.getAllCampaigns(filters, pagination);

            return paginationResponse(res, {
                data: result.campaigns,
                pagination: result.pagination
            });
        } catch (error) {
            logger.error('Get all campaigns controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * GET /api/campaigns/stats
     * Kampanya istatistikleri
     */
    async getStats(req, res) {
        try {
            const stats = await campaignService.getCampaignStats();
            return successResponse(res, stats, 'Kampanya istatistikleri getirildi');
        } catch (error) {
            logger.error('Get campaign stats controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * GET /api/campaigns/active
     * Aktif kampanyalar
     */
    async getActiveCampaigns(req, res) {
        try {
            const campaigns = await campaignService.getActiveCampaigns();
            return successResponse(res, campaigns, 'Aktif kampanyalar getirildi');
        } catch (error) {
            logger.error('Get active campaigns controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * GET /api/campaigns/upcoming
     * Yaklaşan kampanyalar
     */
    async getUpcomingCampaigns(req, res) {
        try {
            const campaigns = await campaignService.getUpcomingCampaigns();
            return successResponse(res, campaigns, 'Yaklaşan kampanyalar getirildi');
        } catch (error) {
            logger.error('Get upcoming campaigns controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * GET /api/campaigns/:id
     * ID ile kampanya getir
     */
    async getCampaignById(req, res) {
        try {
            const { id } = req.params;
            const campaign = await campaignService.getCampaignById(id);
            return successResponse(res, campaign, 'Kampanya getirildi');
        } catch (error) {
            logger.error('Get campaign by ID controller error:', error);
            const status = error.message === 'Kampanya bulunamadı' ? 404 : 500;
            return errorResponse(res, error.message, status);
        }
    }

    /**
     * POST /api/campaigns
     * Yeni kampanya oluştur
     */
    async createCampaign(req, res) {
        try {
            const userId = (req.user && req.user.userId) || null;
            const campaign = await campaignService.createCampaign(req.body, userId);
            return successResponse(res, campaign, 'Kampanya oluşturuldu', 201);
        } catch (error) {
            logger.error('Create campaign controller error:', error);
            return errorResponse(res, error.message, 400);
        }
    }

    /**
     * PUT /api/campaigns/:id
     * Kampanya güncelle
     */
    async updateCampaign(req, res) {
        try {
            const { id } = req.params;
            const campaign = await campaignService.updateCampaign(id, req.body);
            return successResponse(res, campaign, 'Kampanya güncellendi');
        } catch (error) {
            logger.error('Update campaign controller error:', error);
            const status = error.message === 'Kampanya bulunamadı' ? 404 : 400;
            return errorResponse(res, error.message, status);
        }
    }

    /**
     * DELETE /api/campaigns/:id
     * Kampanya sil
     */
    async deleteCampaign(req, res) {
        try {
            const { id } = req.params;
            const result = await campaignService.deleteCampaign(id);
            return successResponse(res, result, 'Kampanya silindi');
        } catch (error) {
            logger.error('Delete campaign controller error:', error);
            const status = error.message === 'Kampanya bulunamadı' ? 404 : 400;
            return errorResponse(res, error.message, status);
        }
    }

    /**
     * POST /api/campaigns/update-statuses
     * Kampanya durumlarını otomatik güncelle
     */
    async updateStatuses(req, res) {
        try {
            const count = await campaignService.updateCampaignStatuses();
            return successResponse(res, { updated: count }, `${count} kampanya durumu güncellendi`);
        } catch (error) {
            logger.error('Update campaign statuses controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }
}

module.exports = new CampaignController();