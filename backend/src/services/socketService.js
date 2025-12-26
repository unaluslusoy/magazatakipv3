/**
 * Socket.IO Configuration & Event Handlers
 * Real-time communication with TV devices
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const logger = require('../utils/logger');
const Device = require('../models/Device');

class SocketService {
    constructor() {
        this.io = null;
        this.connectedDevices = new Map(); // device_code -> socket.id mapping
    }

    /**
     * Initialize Socket.IO server
     * @param {http.Server} httpServer - Express HTTP server
     */
    initialize(httpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: process.env.CORS_ORIGIN || '*',
                methods: ['GET', 'POST'],
                credentials: true
            },
            transports: ['websocket', 'polling'],
            pingTimeout: 60000,
            pingInterval: 25000
        });

        this.setupMiddleware();
        this.setupEventHandlers();

        logger.info('✅ Socket.IO server initialized');
    }

    /**
     * Authentication middleware for Socket.IO
     */
    setupMiddleware() {
        this.io.use(async(socket, next) => {
            try {
                const authHeader = socket.handshake.headers.authorization;
                const token = socket.handshake.auth.token || (authHeader ? authHeader.replace('Bearer ', '') : null);
                const deviceCode = socket.handshake.auth.device_code;

                if (!token) {
                    logger.warn(`Socket connection rejected: No token provided`);
                    return next(new Error('Authentication required'));
                }

                // Verify JWT token
                const decoded = jwt.verify(token, jwtConfig.secret);
                socket.userId = decoded.userId;
                socket.userRole = decoded.role;
                socket.deviceCode = deviceCode;

                logger.debug(`Socket authenticated: User ${socket.userId} (${socket.userRole}), Device: ${deviceCode || 'N/A'}`);
                next();
            } catch (error) {
                logger.error(`Socket authentication failed: ${error.message}`);
                next(new Error('Invalid token'));
            }
        });
    }

    /**
     * Setup all Socket.IO event handlers
     */
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            logger.info(`🔌 Socket connected: ${socket.id} (User: ${socket.userId})`);

            // Device registration
            if (socket.deviceCode) {
                this.handleDeviceConnection(socket);
            }

            // Heartbeat event
            socket.on('heartbeat', (data) => this.handleHeartbeat(socket, data));

            // Sync request
            socket.on('sync:request', (data) => this.handleSyncRequest(socket, data));

            // Playback status
            socket.on('playback:status', (data) => this.handlePlaybackStatus(socket, data));

            // Error reporting
            socket.on('error:report', (data) => this.handleErrorReport(socket, data));

            // Disconnect
            socket.on('disconnect', (reason) => this.handleDisconnect(socket, reason));

            // Send welcome message
            socket.emit('connected', {
                message: 'Connected to MağazaPano Server',
                socketId: socket.id,
                timestamp: new Date().toISOString()
            });
        });
    }

    /**
     * Handle device connection
     */
    async handleDeviceConnection(socket) {
        try {
            const device = await Device.findOne({ where: { device_code: socket.deviceCode } });

            if (!device) {
                logger.warn(`Unknown device tried to connect: ${socket.deviceCode}`);
                socket.emit('error', { message: 'Device not registered' });
                return;
            }

            // Update device status
            await device.update({
                status: 'online',
                last_seen_at: new Date(),
                socket_id: socket.id
            });

            // Store in connected devices map
            this.connectedDevices.set(socket.deviceCode, socket.id);

            // Join device-specific room
            socket.join(`device:${socket.deviceCode}`);

            logger.info(`📱 Device connected: ${device.name} (${socket.deviceCode})`);

            // Send device configuration
            socket.emit('device:config', {
                device_id: device.id,
                device_code: device.device_code,
                name: device.name,
                playlist_id: device.playlist_id,
                layout: device.layout,
                orientation: device.orientation
            });

        } catch (error) {
            logger.error(`Device connection error: ${error.message}`);
        }
    }

    /**
     * Handle heartbeat from device
     */
    async handleHeartbeat(socket, data) {
        try {
            if (!socket.deviceCode) return;

            const device = await Device.findOne({ where: { device_code: socket.deviceCode } });

            if (device) {
                await device.update({
                    last_seen_at: new Date(),
                    status: 'online',
                    last_heartbeat_data: data
                });

                socket.emit('heartbeat:ack', {
                    timestamp: new Date().toISOString(),
                    status: 'ok'
                });

                logger.debug(`💓 Heartbeat from ${socket.deviceCode}: ${JSON.stringify(data)}`);
            }
        } catch (error) {
            logger.error(`Heartbeat error: ${error.message}`);
        }
    }

    /**
     * Handle sync request from device
     */
    async handleSyncRequest(socket, data) {
        try {
            if (!socket.deviceCode) return;

            const device = await Device.findOne({
                where: { device_code: socket.deviceCode },
                include: ['playlist', 'store']
            });

            if (!device || !device.playlist) {
                socket.emit('sync:response', {
                    success: false,
                    message: 'No playlist assigned'
                });
                return;
            }

            // Get full playlist data with contents
            const Playlist = require('../models/Playlist');
            const fullPlaylist = await Playlist.findByPk(device.playlist_id, {
                include: ['contents']
            });

            socket.emit('sync:response', {
                success: true,
                data: {
                    playlist: fullPlaylist,
                    device_config: {
                        layout: device.layout,
                        orientation: device.orientation
                    },
                    timestamp: new Date().toISOString()
                }
            });

            logger.info(`🔄 Sync sent to ${socket.deviceCode}`);
        } catch (error) {
            logger.error(`Sync request error: ${error.message}`);
            socket.emit('sync:response', {
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Handle playback status updates
     */
    async handlePlaybackStatus(socket, data) {
        try {
            logger.debug(`▶️ Playback status from ${socket.deviceCode}: ${JSON.stringify(data)}`);

            // Store playback log (implement later if needed)
            socket.emit('playback:ack', {
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error(`Playback status error: ${error.message}`);
        }
    }

    /**
     * Handle error reports from devices
     */
    async handleErrorReport(socket, data) {
        try {
            logger.error(`❌ Device error from ${socket.deviceCode}: ${JSON.stringify(data)}`);

            // Store error log (implement later if needed)
            socket.emit('error:ack', {
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error(`Error report handling failed: ${error.message}`);
        }
    }

    /**
     * Handle socket disconnect
     */
    async handleDisconnect(socket, reason) {
        logger.info(`🔌 Socket disconnected: ${socket.id} (Reason: ${reason})`);

        if (socket.deviceCode) {
            try {
                const device = await Device.findOne({ where: { device_code: socket.deviceCode } });

                if (device) {
                    await device.update({
                        status: 'offline',
                        socket_id: null
                    });

                    this.connectedDevices.delete(socket.deviceCode);
                    logger.info(`📱 Device disconnected: ${device.name} (${socket.deviceCode})`);
                }
            } catch (error) {
                logger.error(`Disconnect handler error: ${error.message}`);
            }
        }
    }

    /**
     * Broadcast playlist update to specific device
     */
    async notifyPlaylistUpdate(deviceCode, playlistId) {
        const socketId = this.connectedDevices.get(deviceCode);

        if (socketId) {
            this.io.to(`device:${deviceCode}`).emit('playlist:updated', {
                playlist_id: playlistId,
                timestamp: new Date().toISOString(),
                message: 'Playlist has been updated, please sync'
            });

            logger.info(`📢 Playlist update notification sent to ${deviceCode}`);
        }
    }

    /**
     * Broadcast to all connected devices
     */
    broadcastToAllDevices(event, data) {
        this.io.emit(event, {
            ...data,
            timestamp: new Date().toISOString()
        });

        logger.info(`📢 Broadcast to all devices: ${event}`);
    }

    /**
     * Send message to specific device
     */
    sendToDevice(deviceCode, event, data) {
        this.io.to(`device:${deviceCode}`).emit(event, {
            ...data,
            timestamp: new Date().toISOString()
        });

        logger.debug(`📤 Message sent to ${deviceCode}: ${event}`);
    }

    /**
     * Get all connected devices
     */
    getConnectedDevices() {
        return Array.from(this.connectedDevices.entries()).map(([deviceCode, socketId]) => ({
            deviceCode,
            socketId
        }));
    }

    /**
     * Check if device is connected
     */
    isDeviceConnected(deviceCode) {
        return this.connectedDevices.has(deviceCode);
    }
}

// Export singleton instance
const socketService = new SocketService();
module.exports = socketService;