/**
 * Template Migration Script
 */

const fs = require('fs').promises;
const path = require('path');
const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

async function runTemplateMigration() {
    const sequelize = new Sequelize(
        config.database,
        config.username,
        config.password, {
            host: config.host,
            port: config.port,
            dialect: config.dialect,
            dialectOptions: config.dialectOptions,
            logging: console.log
        }
    );

    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        const sqlPath = path.join(__dirname, '../../database/migrations/004_templates.sql');
        const sql = await fs.readFile(sqlPath, 'utf8');

        await sequelize.query(sql);
        console.log('✅ Template migration completed');

        await sequelize.close();
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runTemplateMigration();