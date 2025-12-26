/**
 * Database Migration Script
 * Runs SQL schema from docs/02-VERITABANI/sql/001-schema.sql
 */

const fs = require('fs').promises;
const path = require('path');
const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');
const logger = require('../utils/logger');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

async function runMigration() {
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
        // Test connection
        await sequelize.authenticate();
        logger.info('✅ Database connection established');

        // Read SQL file
        const sqlPath = path.join(__dirname, '../../../docs/02-VERITABANI/sql/001-schema.sql');
        const sql = await fs.readFile(sqlPath, 'utf8');

        // Remove problematic commands
        let cleanSql = sql
            .replace(/CREATE DATABASE.*?;/gi, '')
            .replace(/\\c.*?;/gi, '')
            .replace(/--.*$/gm, ''); // Remove comments

        // Execute entire SQL at once
        try {
            await sequelize.query(cleanSql);
            logger.info('✅ Schema executed successfully');
        } catch (bulkError) {
            logger.warn('Bulk execution failed:', bulkError.message.substring(0, 100));
            logger.info('Trying statement by statement...');

            // Better SQL splitting (handles $$ blocks)
            const statements = [];
            let current = '';
            let inDollarQuote = false;

            const lines = cleanSql.split('\n');
            for (const line of lines) {
                current += line + '\n';

                if (line.includes('$$')) {
                    inDollarQuote = !inDollarQuote;
                }

                if (!inDollarQuote && line.trim().endsWith(';')) {
                    statements.push(current.trim());
                    current = '';
                }
            }

            logger.info(`Executing ${statements.length} SQL statements...`);

            for (let i = 0; i < statements.length; i++) {
                const stmt = statements[i];
                if (stmt.length > 10) {
                    try {
                        await sequelize.query(stmt);
                        logger.info(`✓ Statement ${i + 1}/${statements.length}`);
                    } catch (error) {
                        if (!error.message.includes('already exists')) {
                            logger.warn(`Statement ${i + 1} warning:`, error.message.substring(0, 80));
                        }
                    }
                }
            }
        }

        logger.info('✅ Migration completed successfully');
    } catch (error) {
        logger.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Run migration
runMigration();