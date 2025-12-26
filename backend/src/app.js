/**
 * MağazaPano Backend API
 * Main Application Entry Point
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const appConfig = require('./config/app');
const logger = require('./utils/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const socketService = require('./services/socketService');

// Initialize Express app
const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
if (appConfig.env === 'production') {
    app.use(helmet());
} else {
    // Development: Gevşetilmiş CSP (test sayfaları için)
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                scriptSrcAttr: ["'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"]
            }
        }
    }));
}

// CORS
app.use(cors(appConfig.cors));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Compression
app.use(compression());

// HTTP request logger
if (appConfig.env === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', {
        stream: {
            write: (message) => logger.info(message.trim())
        }
    }));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: appConfig.rateLimit.windowMs,
    max: appConfig.rateLimit.max,
    message: {
        success: false,
        message: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',
        error: {
            code: 429,
            message: 'Too many requests'
        }
    }
});
app.use('/api/', limiter);

// Static files (uploads)
app.use('/uploads', express.static(appConfig.upload.directory));

// Test page (development only)
if (appConfig.env === 'development') {
    app.use(express.static('.'));
}

// Favicon ve DevTools route'larını sessizce ignore et (404 loglamadan)
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/.well-known/*', (req, res) => res.status(204).end());

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

const sequelize = require('./config/sequelize');
const setupAssociations = require('./models/associations');

// Setup model associations
setupAssociations();

// Test database connection
sequelize.authenticate()
    .then(() => {
        logger.info('✅ Database connection established successfully');
    })
    .catch(err => {
        logger.error('❌ Unable to connect to database:', err);
        process.exit(1);
    });

// Attach sequelize to app
app.set('sequelize', sequelize);

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'MağazaPano API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: appConfig.env
    });
});

// API version
app.get(appConfig.apiPrefix, (req, res) => {
    res.json({
        success: true,
        message: 'MağazaPano API v1.0.0',
        documentation: '/api/docs'
    });
});

// Import route modules
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/contents');
const storeRoutes = require('./routes/stores');
const playlistRoutes = require('./routes/playlists');
const deviceRoutes = require('./routes/devices');
const scheduleRoutes = require('./routes/schedules');
const campaignRoutes = require('./routes/campaigns');
const reportRoutes = require('./routes/reports');
// const userRoutes = require('./routes/users'); // TODO: Fix Node cache issue
// Template routes temporarily disabled
// const templateRoutes = require('./routes/templates');

// Register routes
app.use(`${appConfig.apiPrefix}/auth`, authRoutes);
app.use(`${appConfig.apiPrefix}/contents`, contentRoutes);
app.use(`${appConfig.apiPrefix}/stores`, storeRoutes);
app.use(`${appConfig.apiPrefix}/playlists`, playlistRoutes);
app.use(`${appConfig.apiPrefix}/devices`, deviceRoutes);
app.use(`${appConfig.apiPrefix}/schedules`, scheduleRoutes);
app.use(`${appConfig.apiPrefix}/campaigns`, campaignRoutes);
app.use(`${appConfig.apiPrefix}/reports`, reportRoutes);
// app.use(`${appConfig.apiPrefix}/users`, userRoutes); // TODO: Fix Node cache issue
// app.use(`${appConfig.apiPrefix}/templates`, templateRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ============================================================================
// SERVER
// ============================================================================

const PORT = appConfig.port;

const server = app.listen(PORT, () => {
    logger.info(`🚀 Server started on port ${PORT}`);
    logger.info(`📍 Environment: ${appConfig.env}`);
    logger.info(`🌐 API URL: http://localhost:${PORT}${appConfig.apiPrefix}`);
    logger.info(`🔐 Auth endpoints available at /api/auth/*`);

    if (appConfig.env === 'development') {
        logger.info(`📊 Health check: http://localhost:${PORT}/health`);
    }
});

// Initialize Socket.IO
socketService.initialize(server);

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        if (socketService.io) {
            socketService.io.close();
            logger.info('Socket.IO server closed');
        }
        sequelize.close();
        process.exit(0);
    });
});

module.exports = { app, socketService };