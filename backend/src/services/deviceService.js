/**
 * Device Service
 * Cihaz yönetim servisi
 */

const Device = require('../models/Device');
const Store = require('../models/Store');
const Playlist = require('../models/Playlist');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const crypto = require('crypto');

class DeviceService {
    /**
     * Tüm cihazları getir
     */
    async getAllDevices(filters = {}, pagination = {}) {
        try {
            const where = {};

            // Filters
            if (filters.is_active !== undefined) {
                where.is_active = filters.is_active;
            }

            if (filters.status) {
                where.status = filters.status;
            }

            if (filters.store_id) {
                where.store_id = parseInt(filters.store_id);
            }

            if (filters.search) {
                where[Op.or] = [{
                        name: {
                            [Op.iLike]: `%${filters.search}%`
                        }
                    },
                    {
                        device_code: {
                            [Op.iLike]: `%${filters.search}%`
                        }
                    }
                ];
            }

            // Online filter
            if (filters.online === 'true') {
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
                where.status = 'online';
                where.last_heartbeat = {
                    [Op.gte]: fiveMinutesAgo
                };
            }

            // Pagination
            const page = pagination.page || 1;
            const limit = pagination.limit || 20;
            const offset = (page - 1) * limit;

            const { count, rows } = await Device.findAndCountAll({
                where,
                include: [{
                        model: Store,
                        as: 'store',
                        attributes: ['id', 'name', 'code', 'city']
                    },
                    {
                        model: Playlist,
                        as: 'current_playlist',
                        attributes: ['id', 'name', 'duration_seconds'],
                        required: false
                    }
                ],
                limit,
                offset,
                order: [
                    ['status', 'ASC'],
                    ['name', 'ASC']
                ],
                distinct: true
            });

            return {
                devices: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                }
            };
        } catch (error) {
            logger.error('Get all devices service error:', error);
            throw error;
        }
    }

    /**
     * ID ile cihaz getir
     */
    async getDeviceById(id) {
        try {
            const device = await Device.findByPk(id, {
                include: [{
                        model: Store,
                        as: 'store',
                        attributes: ['id', 'name', 'code', 'city', 'address']
                    },
                    {
                        model: Playlist,
                        as: 'current_playlist',
                        attributes: ['id', 'name', 'description', 'duration_seconds'],
                        required: false
                    }
                ]
            });

            if (!device) {
                throw new Error('Cihaz bulunamadı');
            }

            return device;
        } catch (error) {
            logger.error('Get device by ID service error:', error);
            throw error;
        }
    }

    /**
     * Yeni cihaz oluştur
     */
    async createDevice(data) {
        try {
            // Store kontrolü
            const store = await Store.findByPk(data.store_id);
            if (!store) {
                throw new Error('Mağaza bulunamadı');
            }

            // Activation code oluştur
            const activationCode = this.generateActivationCode();

            const device = await Device.create({
                ...data,
                activation_code: activationCode,
                status: 'offline'
            });

            logger.info(`Device created: ${device.name} (${device.device_code})`);
            return device;
        } catch (error) {
            logger.error('Create device service error:', error);
            throw error;
        }
    }

    /**
     * Cihaz güncelle
     */
    async updateDevice(id, data) {
        try {
            const device = await Device.findByPk(id);

            if (!device) {
                throw new Error('Cihaz bulunamadı');
            }

            // Güncelle
            const allowedFields = [
                'name', 'store_id', 'current_playlist_id',
                'layout_type', 'orientation', 'volume_level',
                'brightness_level', 'is_active'
            ];

            Object.keys(data).forEach(key => {
                if (allowedFields.includes(key)) {
                    device[key] = data[key];
                }
            });

            await device.save();

            logger.info(`Device updated: ${device.name} (ID: ${id})`);
            return device;
        } catch (error) {
            logger.error('Update device service error:', error);
            throw error;
        }
    }

    /**
     * Cihaz sil
     */
    async deleteDevice(id) {
        try {
            const device = await Device.findByPk(id);

            if (!device) {
                throw new Error('Cihaz bulunamadı');
            }

            await device.destroy();

            logger.info(`Device deleted: ID ${id}`);
            return { message: 'Cihaz başarıyla silindi' };
        } catch (error) {
            logger.error('Delete device service error:', error);
            throw error;
        }
    }

    /**
     * Heartbeat güncelle
     */
    async updateHeartbeat(deviceCode, deviceInfo = {}) {
        try {
            const device = await Device.findOne({
                where: { device_code: deviceCode }
            });

            if (!device) {
                throw new Error('Cihaz bulunamadı');
            }

            // Heartbeat güncelle
            device.last_heartbeat = new Date();
            device.status = 'online';

            // Cihaz bilgilerini güncelle
            if (deviceInfo.ip_address) device.ip_address = deviceInfo.ip_address;
            if (deviceInfo.app_version) device.app_version = deviceInfo.app_version;
            if (deviceInfo.os_version) device.os_version = deviceInfo.os_version;
            if (deviceInfo.free_storage_mb) device.free_storage_mb = deviceInfo.free_storage_mb;

            await device.save();

            return device;
        } catch (error) {
            logger.error('Update heartbeat service error:', error);
            throw error;
        }
    }

    /**
     * Cihaz durumunu kontrol et ve güncelle
     */
    async checkAndUpdateDeviceStatuses() {
        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

            // Online olarak işaretlenmiş ama heartbeat göndermeyen cihazları offline yap
            const offlineCount = await Device.update({ status: 'offline' }, {
                where: {
                    status: 'online',
                    [Op.or]: [{
                            last_heartbeat: {
                                [Op.lt]: fiveMinutesAgo
                            }
                        },
                        { last_heartbeat: null }
                    ]
                }
            });

            logger.info(`Updated ${offlineCount[0]} devices to offline status`);
            return offlineCount[0];
        } catch (error) {
            logger.error('Check device statuses service error:', error);
            throw error;
        }
    }

    /**
     * Cihaz istatistikleri
     */
    async getDeviceStats() {
        try {
            const total = await Device.count();
            const active = await Device.count({ where: { is_active: true } });

            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const online = await Device.count({
                where: {
                    status: 'online',
                    last_heartbeat: {
                        [Op.gte]: fiveMinutesAgo
                    }
                }
            });

            const offline = await Device.count({
                where: {
                    [Op.or]: [
                        { status: 'offline' },
                        {
                            last_heartbeat: {
                                [Op.lt]: fiveMinutesAgo
                            }
                        },
                        { last_heartbeat: null }
                    ]
                }
            });

            const error = await Device.count({ where: { status: 'error' } });
            const maintenance = await Device.count({ where: { status: 'maintenance' } });

            return {
                total,
                active,
                inactive: total - active,
                online,
                offline,
                error,
                maintenance
            };
        } catch (error) {
            logger.error('Get device stats service error:', error);
            throw error;
        }
    }

    /**
     * Activation code oluştur
     */
    generateActivationCode() {
        return crypto.randomBytes(5).toString('hex').toUpperCase().substring(0, 10);
    }

    /**
     * Cihaz aktivasyonu
     */
    async activateDevice(deviceCode, activationCode) {
        try {
            const device = await Device.findOne({
                where: { device_code: deviceCode }
            });

            if (!device) {
                throw new Error('Cihaz bulunamadı');
            }

            if (device.activation_code !== activationCode) {
                throw new Error('Aktivasyon kodu hatalı');
            }

            if (device.activated_at) {
                throw new Error('Cihaz zaten aktive edilmiş');
            }

            // Token oluştur
            const deviceToken = crypto.randomBytes(32).toString('hex');

            device.device_token = deviceToken;
            device.activated_at = new Date();
            device.is_active = true;
            await device.save();

            logger.info(`Device activated: ${device.name} (${deviceCode})`);

            return {
                device,
                token: deviceToken
            };
        } catch (error) {
            logger.error('Activate device service error:', error);
            throw error;
        }
    }

    /**
     * Cihazlara restart komutu gönder
     */
    async sendRestartCommand(deviceId) {
        try {
            const device = await Device.findByPk(deviceId);
            if (!device) {
                throw new Error('Cihaz bulunamadı');
            }

            // Socket üzerinden komut gönder
            const socketService = require('./socketService');
            if (socketService.isDeviceConnected(device.device_code)) {
                socketService.sendCommandToDevice(device.device_code, {
                    command: 'restart',
                    timestamp: new Date().toISOString()
                });

                logger.info(`Restart command sent to device: ${device.device_code}`);
                return {
                    message: 'Yeniden başlatma komutu gönderildi',
                    device_code: device.device_code,
                    status: 'sent'
                };
            } else {
                logger.warn(`Device offline, cannot send restart: ${device.device_code}`);
                return {
                    message: 'Cihaz çevrimdışı, komut gönderilemedi',
                    device_code: device.device_code,
                    status: 'offline'
                };
            }
        } catch (error) {
            logger.error('Send restart command error:', error);
            throw error;
        }
    }

    /**
     * Cihazlara sync komutu gönder
     */
    async sendSyncCommand(deviceId) {
        try {
            const device = await Device.findByPk(deviceId);
            if (!device) {
                throw new Error('Cihaz bulunamadı');
            }

            // İçerikleri hesapla
            const PlaylistContent = require('../models/PlaylistContent');
            const Content = require('../models/Content');

            let contentsToDownload = [];
            let totalSize = 0;

            if (device.playlist_id) {
                const contents = await PlaylistContent.findAll({
                    where: { playlist_id: device.playlist_id },
                    include: [{
                        model: Content,
                        as: 'content',
                        attributes: ['id', 'title', 'type', 'file_url', 'file_size']
                    }]
                });

                contentsToDownload = contents.map(pc => pc.content);
                totalSize = contents.reduce((sum, pc) => sum + (pc.content.file_size || 0), 0);
            }

            // Socket üzerinden komut gönder
            const socketService = require('./socketService');
            if (socketService.isDeviceConnected(device.device_code)) {
                socketService.sendCommandToDevice(device.device_code, {
                    command: 'sync',
                    playlist_id: device.playlist_id,
                    timestamp: new Date().toISOString()
                });

                logger.info(`Sync command sent to device: ${device.device_code}`);
                return {
                    message: 'Senkronizasyon başlatıldı',
                    device_code: device.device_code,
                    contents_to_download: contentsToDownload.length,
                    total_size_mb: (totalSize / (1024 * 1024)).toFixed(2)
                };
            } else {
                logger.warn(`Device offline, cannot send sync: ${device.device_code}`);
                return {
                    message: 'Cihaz çevrimdışı, komut gönderilemedi',
                    device_code: device.device_code,
                    status: 'offline'
                };
            }
        } catch (error) {
            logger.error('Send sync command error:', error);
            throw error;
        }
    }
}

module.exports = new DeviceService();