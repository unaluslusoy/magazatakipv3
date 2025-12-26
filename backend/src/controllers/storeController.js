const storeService = require('../services/storeService');
const { successResponse, errorResponse, paginationResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Store Controller
 * Mağaza yönetimi endpoint'leri
 */
class StoreController {
    /**
     * GET /api/stores
     * Tüm mağazaları listele
     */
    async getAllStores(req, res) {
        try {
            const filters = {
                is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
                city: req.query.city,
                search: req.query.search
            };

            const pagination = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20
            };

            const result = await storeService.getAllStores(filters, pagination);

            return paginationResponse(res, {
                data: result.stores,
                pagination: result.pagination
            });
        } catch (error) {
            logger.error('Get all stores controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * GET /api/stores/stats
     * Mağaza istatistikleri
     */
    async getStoreStats(req, res) {
        try {
            const stats = await storeService.getStoreStats();
            return successResponse(res, { stats });
        } catch (error) {
            logger.error('Get store stats controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * GET /api/stores/cities
     * Şehir listesi
     */
    async getCities(req, res) {
        try {
            const cities = await storeService.getCities();
            return successResponse(res, { cities });
        } catch (error) {
            logger.error('Get cities controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * GET /api/stores/:id
     * Tek mağaza detayı
     */
    async getStoreById(req, res) {
        try {
            const { id } = req.params;
            const store = await storeService.getStoreById(id);

            return successResponse(res, { store });
        } catch (error) {
            logger.error('Get store by ID controller error:', error);
            return errorResponse(res, error.message, 404);
        }
    }

    /**
     * POST /api/stores
     * Yeni mağaza oluştur
     */
    async createStore(req, res) {
        try {
            const store = await storeService.createStore(req.body);

            return successResponse(res, {
                message: 'Mağaza başarıyla oluşturuldu',
                store
            }, 201);
        } catch (error) {
            logger.error('Create store controller error:', error);
            return errorResponse(res, error.message, 400);
        }
    }

    /**
     * PUT /api/stores/:id
     * Mağaza güncelle
     */
    async updateStore(req, res) {
        try {
            const { id } = req.params;
            const store = await storeService.updateStore(id, req.body);

            return successResponse(res, {
                message: 'Mağaza başarıyla güncellendi',
                store
            });
        } catch (error) {
            logger.error('Update store controller error:', error);
            return errorResponse(res, error.message, 400);
        }
    }

    /**
     * DELETE /api/stores/:id
     * Mağaza sil
     */
    async deleteStore(req, res) {
        try {
            const { id } = req.params;
            const result = await storeService.deleteStore(id);

            return successResponse(res, result);
        } catch (error) {
            logger.error('Delete store controller error:', error);
            return errorResponse(res, error.message, 404);
        }
    }
}

module.exports = new StoreController();