/**
 * Campaign Service
 * Kampanya yönetim servisi
 */

const Campaign = require('../models/Campaign');
const CampaignStore = require('../models/CampaignStore');
const Store = require('../models/Store');
const Playlist = require('../models/Playlist');
const User = require('../models/User');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class CampaignService {
    /**
     * Tüm kampanyaları getir
     */
    async getAllCampaigns(filters = {}, pagination = {}) {
        try {
            const where = {};

            // Filters
            if (filters.status) {
                where.status = filters.status;
            }

            if (filters.search) {
                where[Op.or] = [
                    { name: {
                            [Op.iLike]: `%${filters.search}%` } },
                    { description: {
                            [Op.iLike]: `%${filters.search}%` } }
                ];
            }

            // Date filters
            if (filters.start_date) {
                where.start_date = {
                    [Op.gte]: filters.start_date };
            }

            if (filters.end_date) {
                where.end_date = {
                    [Op.lte]: filters.end_date };
            }

            // Pagination
            const page = pagination.page || 1;
            const limit = pagination.limit || 20;
            const offset = (page - 1) * limit;

            const { count, rows } = await Campaign.findAndCountAll({
                where,
                include: [{
                        model: Playlist,
                        as: 'playlist',
                        attributes: ['id', 'name', 'duration_seconds']
                    },
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: Store,
                        as: 'stores',
                        attributes: ['id', 'name', 'code', 'city'],
                        through: { attributes: [] }
                    }
                ],
                limit,
                offset,
                order: [
                    ['created_at', 'DESC']
                ],
                distinct: true
            });

            return {
                campaigns: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                }
            };
        } catch (error) {
            logger.error('Get all campaigns service error:', error);
            throw error;
        }
    }

    /**
     * ID ile kampanya getir
     */
    async getCampaignById(id) {
        try {
            const campaign = await Campaign.findByPk(id, {
                include: [{
                        model: Playlist,
                        as: 'playlist',
                        attributes: ['id', 'name', 'description', 'duration_seconds']
                    },
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: Store,
                        as: 'stores',
                        attributes: ['id', 'name', 'code', 'city', 'address'],
                        through: { attributes: [] }
                    }
                ]
            });

            if (!campaign) {
                throw new Error('Kampanya bulunamadı');
            }

            return campaign;
        } catch (error) {
            logger.error('Get campaign by ID service error:', error);
            throw error;
        }
    }

    /**
     * Yeni kampanya oluştur
     */
    async createCampaign(data, userId) {
        try {
            // Playlist kontrolü
            if (data.playlist_id) {
                const playlist = await Playlist.findByPk(data.playlist_id);
                if (!playlist) {
                    throw new Error('Playlist bulunamadı');
                }
            }

            // Mağaza kontrolü
            if (data.store_ids && data.store_ids.length > 0) {
                const stores = await Store.findAll({
                    where: { id: {
                            [Op.in]: data.store_ids } }
                });

                if (stores.length !== data.store_ids.length) {
                    throw new Error('Bazı mağazalar bulunamadı');
                }
            }

            // Kampanya oluştur
            const campaign = await Campaign.create({
                ...data,
                created_by: userId
            });

            // Mağaza ilişkileri ekle
            if (data.store_ids && data.store_ids.length > 0) {
                await Promise.all(
                    data.store_ids.map(storeId =>
                        CampaignStore.create({
                            campaign_id: campaign.id,
                            store_id: storeId
                        })
                    )
                );
            }

            logger.info(`Campaign created: ${campaign.name} (ID: ${campaign.id})`);
            return await this.getCampaignById(campaign.id);
        } catch (error) {
            logger.error('Create campaign service error:', error);
            throw error;
        }
    }

    /**
     * Kampanya güncelle
     */
    async updateCampaign(id, data) {
        try {
            const campaign = await Campaign.findByPk(id);

            if (!campaign) {
                throw new Error('Kampanya bulunamadı');
            }

            // Playlist değişiyorsa kontrol et
            if (data.playlist_id && data.playlist_id !== campaign.playlist_id) {
                const playlist = await Playlist.findByPk(data.playlist_id);
                if (!playlist) {
                    throw new Error('Playlist bulunamadı');
                }
            }

            // Güncelle
            const allowedFields = [
                'name', 'description', 'playlist_id', 'start_date',
                'end_date', 'priority', 'status'
            ];

            Object.keys(data).forEach(key => {
                if (allowedFields.includes(key)) {
                    campaign[key] = data[key];
                }
            });

            await campaign.save();

            // Mağaza ilişkilerini güncelle
            if (data.store_ids !== undefined) {
                // Mevcut ilişkileri sil
                await CampaignStore.destroy({ where: { campaign_id: id } });

                // Yeni ilişkileri ekle
                if (data.store_ids.length > 0) {
                    await Promise.all(
                        data.store_ids.map(storeId =>
                            CampaignStore.create({
                                campaign_id: id,
                                store_id: storeId
                            })
                        )
                    );
                }
            }

            logger.info(`Campaign updated: ID ${id}`);
            return await this.getCampaignById(id);
        } catch (error) {
            logger.error('Update campaign service error:', error);
            throw error;
        }
    }

    /**
     * Kampanya sil
     */
    async deleteCampaign(id) {
        try {
            const campaign = await Campaign.findByPk(id);

            if (!campaign) {
                throw new Error('Kampanya bulunamadı');
            }

            await campaign.destroy();

            logger.info(`Campaign deleted: ID ${id}`);
            return { message: 'Kampanya başarıyla silindi' };
        } catch (error) {
            logger.error('Delete campaign service error:', error);
            throw error;
        }
    }

    /**
     * Aktif kampanyaları getir
     */
    async getActiveCampaigns() {
        try {
            const campaigns = await Campaign.findActive();
            return campaigns;
        } catch (error) {
            logger.error('Get active campaigns service error:', error);
            throw error;
        }
    }

    /**
     * Yaklaşan kampanyaları getir
     */
    async getUpcomingCampaigns() {
        try {
            const campaigns = await Campaign.findUpcoming();
            return campaigns;
        } catch (error) {
            logger.error('Get upcoming campaigns service error:', error);
            throw error;
        }
    }

    /**
     * Kampanya istatistikleri
     */
    async getCampaignStats() {
        try {
            const total = await Campaign.count();
            const active = await Campaign.count({ where: { status: 'active' } });
            const pending = await Campaign.count({ where: { status: 'pending' } });
            const completed = await Campaign.count({ where: { status: 'completed' } });
            const cancelled = await Campaign.count({ where: { status: 'cancelled' } });

            return {
                total,
                active,
                pending,
                completed,
                cancelled
            };
        } catch (error) {
            logger.error('Get campaign stats service error:', error);
            throw error;
        }
    }

    /**
     * Kampanya durumlarını otomatik güncelle
     */
    async updateCampaignStatuses() {
        try {
            const campaigns = await Campaign.findAll({
                where: {
                    status: {
                        [Op.in]: ['pending', 'active'] }
                }
            });

            let updatedCount = 0;
            for (const campaign of campaigns) {
                const oldStatus = campaign.status;
                await campaign.updateStatus();
                if (campaign.status !== oldStatus) {
                    updatedCount++;
                }
            }

            logger.info(`Updated ${updatedCount} campaign statuses`);
            return updatedCount;
        } catch (error) {
            logger.error('Update campaign statuses service error:', error);
            throw error;
        }
    }
}

module.exports = new CampaignService();