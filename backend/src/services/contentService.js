const Content = require('../models/Content');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Content Service
 * İçerik işlemleri business logic
 */
class ContentService {
    /**
     * Tüm içerikleri getir (filtreleme + sayfalama)
     */
    async getAllContents(filters = {}, pagination = {}) {
        try {
            const { page = 1, limit = 20 } = pagination;
            const offset = (page - 1) * limit;

            const where = { is_active: true };

            // Filtreler
            if (filters.type) where.type = filters.type;
            if (filters.status) where.status = filters.status;
            if (filters.created_by) where.created_by = filters.created_by;

            if (filters.search) {
                where[Op.or] = [
                    { name: {
                            [Op.iLike]: `%${filters.search}%` } },
                    { description: {
                            [Op.iLike]: `%${filters.search}%` } }
                ];
            }

            if (filters.tags && filters.tags.length > 0) {
                where.tags = {
                    [Op.overlap]: filters.tags };
            }

            const { count, rows } = await Content.findAndCountAll({
                where,
                limit,
                offset,
                order: [
                    ['created_at', 'DESC']
                ],
                attributes: { exclude: ['file_path'] }
            });

            return {
                contents: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                }
            };
        } catch (error) {
            logger.error('Get all contents error:', error);
            throw error;
        }
    }

    /**
     * ID ile içerik getir
     */
    async getContentById(id) {
        try {
            const content = await Content.findByPk(id, {
                attributes: { exclude: ['file_path'] }
            });

            if (!content) {
                throw new Error('İçerik bulunamadı');
            }

            return content;
        } catch (error) {
            logger.error('Get content by ID error:', error);
            throw error;
        }
    }

    /**
     * Yeni içerik oluştur
     */
    async createContent(data, userId) {
        try {
            const content = await Content.create({
                ...data,
                created_by: userId
            });

            logger.info(`Content created: ${content.name} (${content.type}) by user ${userId}`);

            return content;
        } catch (error) {
            logger.error('Create content error:', error);
            throw error;
        }
    }

    /**
     * İçerik güncelle
     */
    async updateContent(id, data) {
        try {
            const content = await Content.findByPk(id);

            if (!content) {
                throw new Error('İçerik bulunamadı');
            }

            // Güncellenebilir alanlar
            const allowedFields = [
                'name', 'description', 'type', 'file_url', 'thumbnail_url',
                'file_size', 'mime_type', 'duration_seconds', 'resolution',
                'slider_settings', 'ticker_text', 'ticker_settings',
                'announcement_title', 'announcement_type', 'announcement_settings',
                'tags', 'status'
            ];

            const updates = {};
            allowedFields.forEach(field => {
                if (data[field] !== undefined) {
                    updates[field] = data[field];
                }
            });

            await content.update(updates);

            logger.info(`Content updated: ${content.name} (ID: ${id})`);

            return content;
        } catch (error) {
            logger.error('Update content error:', error);
            throw error;
        }
    }

    /**
     * İçerik sil (soft delete)
     */
    async deleteContent(id) {
        try {
            const content = await Content.findByPk(id);

            if (!content) {
                throw new Error('İçerik bulunamadı');
            }

            await content.update({ is_active: false, status: 'archived' });

            logger.info(`Content deleted: ${content.name} (ID: ${id})`);

            return { message: 'İçerik başarıyla silindi' };
        } catch (error) {
            logger.error('Delete content error:', error);
            throw error;
        }
    }

    /**
     * Tip bazlı içerik istatistikleri
     */
    async getContentStats() {
        try {
            const stats = await Content.findAll({
                attributes: [
                    'type', [Content.sequelize.fn('COUNT', Content.sequelize.col('id')), 'count']
                ],
                where: { is_active: true },
                group: ['type'],
                raw: true
            });

            return stats.reduce((acc, stat) => {
                acc[stat.type] = parseInt(stat.count);
                return acc;
            }, {});
        } catch (error) {
            logger.error('Get content stats error:', error);
            throw error;
        }
    }
}

module.exports = new ContentService();