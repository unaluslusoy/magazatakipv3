/**
 * Store Service
 * Mağaza/Şube yönetim servisi
 */

const Store = require('../models/Store');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class StoreService {
    /**
     * Tüm mağazaları getir
     */
    async getAllStores(filters = {}, pagination = {}) {
        try {
            const where = {};

            // Filters
            if (filters.is_active !== undefined) {
                where.is_active = filters.is_active;
            }

            if (filters.city) {
                where.city = filters.city;
            }

            if (filters.search) {
                where[Op.or] = [{
                        name: {
                            [Op.iLike]: `%${filters.search}%`
                        }
                    },
                    {
                        code: {
                            [Op.iLike]: `%${filters.search}%`
                        }
                    },
                    {
                        address: {
                            [Op.iLike]: `%${filters.search}%`
                        }
                    }
                ];
            }

            // Pagination
            const page = pagination.page || 1;
            const limit = pagination.limit || 20;
            const offset = (page - 1) * limit;

            const { count, rows } = await Store.findAndCountAll({
                where,
                limit,
                offset,
                order: [
                    ['name', 'ASC']
                ]
            });

            return {
                stores: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                }
            };
        } catch (error) {
            logger.error('Get all stores error:', error);
            throw error;
        }
    }

    /**
     * ID ile mağaza getir
     */
    async getStoreById(id) {
        try {
            const store = await Store.findByPk(id);

            if (!store) {
                throw new Error('Mağaza bulunamadı');
            }

            return store;
        } catch (error) {
            logger.error('Get store by ID error:', error);
            throw error;
        }
    }

    /**
     * Yeni mağaza oluştur
     */
    async createStore(data) {
        try {
            // Kod kontrolü
            const existingStore = await Store.findByCode(data.code);
            if (existingStore) {
                throw new Error('Bu mağaza kodu zaten kullanılıyor');
            }

            const store = await Store.create(data);

            logger.info(`Store created: ${store.name} (${store.code})`);
            return store;
        } catch (error) {
            logger.error('Create store error:', error);
            throw error;
        }
    }

    /**
     * Mağaza güncelle
     */
    async updateStore(id, data) {
        try {
            const store = await Store.findByPk(id);

            if (!store) {
                throw new Error('Mağaza bulunamadı');
            }

            // Kod değişiyorsa kontrol et
            if (data.code && data.code !== store.code) {
                const existingStore = await Store.findByCode(data.code);
                if (existingStore) {
                    throw new Error('Bu mağaza kodu zaten kullanılıyor');
                }
            }

            // Güncelle
            const allowedFields = [
                'code', 'name', 'address', 'city', 'region',
                'phone', 'email', 'manager_name', 'is_active'
            ];

            const updateData = {};
            allowedFields.forEach(field => {
                if (data[field] !== undefined) {
                    updateData[field] = data[field];
                }
            });

            await store.update(updateData);

            logger.info(`Store updated: ${store.name} (${store.code})`);
            return store;
        } catch (error) {
            logger.error('Update store error:', error);
            throw error;
        }
    }

    /**
     * Mağaza sil (soft delete)
     */
    async deleteStore(id) {
        try {
            const store = await Store.findByPk(id);

            if (!store) {
                throw new Error('Mağaza bulunamadı');
            }

            await store.update({ is_active: false });

            logger.info(`Store deleted (soft): ${store.name} (${store.code})`);
            return { message: 'Mağaza başarıyla silindi' };
        } catch (error) {
            logger.error('Delete store error:', error);
            throw error;
        }
    }

    /**
     * Şehir listesi
     */
    async getCities() {
        try {
            const stores = await Store.findAll({
                attributes: ['city'],
                where: {
                    city: {
                        [Op.ne]: null
                    },
                    is_active: true
                },
                group: ['city'],
                order: [
                    ['city', 'ASC']
                ]
            });

            return stores.map(s => s.city);
        } catch (error) {
            logger.error('Get cities error:', error);
            throw error;
        }
    }

    /**
     * Mağaza istatistikleri
     */
    async getStoreStats() {
        try {
            const total = await Store.count();
            const active = await Store.count({ where: { is_active: true } });
            const inactive = await Store.count({ where: { is_active: false } });

            return {
                total,
                active,
                inactive
            };
        } catch (error) {
            logger.error('Get store stats error:', error);
            throw error;
        }
    }
}

module.exports = new StoreService();