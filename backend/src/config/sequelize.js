const { Sequelize } = require('sequelize');
const dbConfig = require('./database');
const appConfig = require('./app');

const env = appConfig.env || 'development';
const config = dbConfig[env];

// Global Sequelize instance
const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password, {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        dialectOptions: config.dialectOptions,
        logging: config.logging,
        pool: config.pool,
        timezone: config.timezone
    }
);

module.exports = sequelize;