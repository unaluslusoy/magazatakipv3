const deviceService = require('../services/deviceService');
const { successResponse, errorResponse, paginationResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Device Controller
 * Cihaz yönetimi endpoint'leri
 */
class DeviceController {
    /**
     * GET /api/devices
     * Tüm cihazları listele
     */
    async getAllDevices(req, res) {
        try {
            const filters = {
                is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
                status: req.query.status,
                store_id: req.query.store_id,
                online: req.query.online,
                search: req.query.search
            };

            const pagination = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20
            };

            const result = await deviceService.getAllDevices(filters, pagination);

            return paginationResponse(res, {
                data: result.devices,
                pagination: result.pagination
            });
        } catch (error) {
            logger.error('Get all devices controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * GET /api/devices/stats
     * Cihaz istatistikleri
     */
    async getStats(req, res) {
        try {
            const stats = await deviceService.getDeviceStats();
            return successResponse(res, stats, 'Cihaz istatistikleri getirildi');
        } catch (error) {
            logger.error('Get device stats controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * GET /api/devices/:id
     * ID ile cihaz getir
     */
    async getDeviceById(req, res) {
        try {
            const { id } = req.params;
            const device = await deviceService.getDeviceById(id);
            return successResponse(res, device, 'Cihaz getirildi');
        } catch (error) {
            logger.error('Get device by ID controller error:', error);
            const status = error.message === 'Cihaz bulunamadı' ? 404 : 500;
            return errorResponse(res, error.message, status);
        }
    }

    /**
     * POST /api/devices
     * Yeni cihaz oluştur
     */
    async createDevice(req, res) {
        try {
            const device = await deviceService.createDevice(req.body);
            return successResponse(res, device, 'Cihaz oluşturuldu', 201);
        } catch (error) {
            logger.error('Create device controller error:', error);
            return errorResponse(res, error.message, 400);
        }
    }

    /**
     * PUT /api/devices/:id
     * Cihaz güncelle
     */
    async updateDevice(req, res) {
        try {
            const { id } = req.params;
            const device = await deviceService.updateDevice(id, req.body);
            return successResponse(res, device, 'Cihaz güncellendi');
        } catch (error) {
            logger.error('Update device controller error:', error);
            const status = error.message === 'Cihaz bulunamadı' ? 404 : 400;
            return errorResponse(res, error.message, status);
        }
    }

    /**
     * DELETE /api/devices/:id
     * Cihaz sil
     */
    async deleteDevice(req, res) {
        try {
            const { id } = req.params;
            const result = await deviceService.deleteDevice(id);
            return successResponse(res, result, 'Cihaz silindi');
        } catch (error) {
            logger.error('Delete device controller error:', error);
            const status = error.message === 'Cihaz bulunamadı' ? 404 : 400;
            return errorResponse(res, error.message, status);
        }
    }

    /**
     * POST /api/devices/:deviceCode/heartbeat
     * Cihaz heartbeat güncelle
     */
    async heartbeat(req, res) {
        try {
            const { deviceCode } = req.params;
            const deviceInfo = req.body;

            const device = await deviceService.updateHeartbeat(deviceCode, deviceInfo);
            return successResponse(res, device, 'Heartbeat güncellendi');
        } catch (error) {
            logger.error('Device heartbeat controller error:', error);
            const status = error.message === 'Cihaz bulunamadı' ? 404 : 400;
            return errorResponse(res, error.message, status);
        }
    }

    /**
     * POST /api/devices/activate
     * Cihaz aktivasyonu
     */
    async activate(req, res) {
        try {
            const { device_code, activation_code } = req.body;

            if (!device_code || !activation_code) {
                return errorResponse(res, 'Cihaz kodu ve aktivasyon kodu gereklidir', 400);
            }

            const result = await deviceService.activateDevice(device_code, activation_code);
            return successResponse(res, result, 'Cihaz aktive edildi');
        } catch (error) {
            logger.error('Activate device controller error:', error);
            const status = error.message.includes('bulunamadı') ? 404 : 400;
            return errorResponse(res, error.message, status);
        }
    }

    /**
     * POST /api/devices/check-statuses
     * Tüm cihaz durumlarını kontrol et
     */
    async checkStatuses(req, res) {
        try {
            const count = await deviceService.checkAndUpdateDeviceStatuses();
            return successResponse(res, { updated: count }, `${count} cihaz offline olarak işaretlendi`);
        } catch (error) {
            logger.error('Check device statuses controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * POST /api/devices/heartbeat
     * Cihaz heartbeat (canlılık sinyali)
     */
    async heartbeat(req, res) {
        try {
            if (!req.device) {
                return errorResponse(res, 'Cihaz bilgisi bulunamadı', 401);
            }

            // Update last_seen
            await req.device.update({ 
                last_seen: new Date(),
                status: 'active'
            });

            logger.debug(`Heartbeat received from device: ${req.device.device_code}`);

            return successResponse(res, { 
                message: 'Heartbeat alındı',
                server_time: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Heartbeat controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * PUT /api/devices/status
     * Cihaz durumunu güncelle
     */
    async updateStatus(req, res) {
        try {
            if (!req.device) {
                return errorResponse(res, 'Cihaz bilgisi bulunamadı', 401);
            }

            const { status } = req.body;

            if (!status || !['active', 'inactive', 'offline'].includes(status)) {
                return errorResponse(res, 'Geçersiz durum değeri', 400);
            }

            await req.device.update({ status });

            logger.info(`Device status updated: ${req.device.device_code} -> ${status}`);

            return successResponse(res, {
                message: 'Durum güncellendi',
                device: req.device
            });
        } catch (error) {
            logger.error('Update device status controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * POST /api/devices/logs
     * Cihazdan log gönderimi
     */
    async sendLog(req, res) {
        try {
            if (!req.device) {
                return errorResponse(res, 'Cihaz bilgisi bulunamadı', 401);
            }

            const { level, message, data, timestamp } = req.body;

            // Log to server logger
            const logMessage = `[DEVICE:${req.device.device_code}] ${message}`;
            
            if (level === 'error') {
                logger.error(logMessage, data);
            } else if (level === 'warning') {
                logger.warn(logMessage, data);
            } else {
                logger.info(logMessage, data);
            }

            // TODO: Save to database if needed
            // await DeviceLog.create({ device_id: req.device.id, level, message, data, timestamp });

            return successResponse(res, { message: 'Log kaydedildi' });
        } catch (error) {
            logger.error('Device send log controller error:', error);
            return errorResponse(res, error.message, 500);
        }
    }
}

module.exports = new DeviceController();