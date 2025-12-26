/**
 * Database Seed Script
 * Inserts demo/default data
 */

const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const dbConfig = require('../config/database');
const logger = require('../utils/logger');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

async function runSeed() {
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
        logger.info('✅ Database connection established');

        // Hash password
        const hashedPassword = await bcrypt.hash('Admin123!', 10);

        // Insert default admin user
        await sequelize.query(`
      INSERT INTO users (email, password_hash, name, role, is_active)
      VALUES 
        ('admin@magazapano.com', '${hashedPassword}', 'Admin Kullanıcı', 'super_admin', true),
        ('editor@magazapano.com', '${hashedPassword}', 'Editör Kullanıcı', 'editor', true)
      ON CONFLICT (email) DO NOTHING;
    `);
        logger.info('✓ Default users created');

        // Insert sample stores
        await sequelize.query(`
      INSERT INTO stores (name, code, city, region, is_active)
      VALUES 
        ('Mağaza İstanbul - Kadıköy', 'IST-KAD-001', 'İstanbul', 'Anadolu', true),
        ('Mağaza İstanbul - Beyoğlu', 'IST-BEY-001', 'İstanbul', 'Avrupa', true),
        ('Mağaza Ankara - Kızılay', 'ANK-KIZ-001', 'Ankara', 'İç Anadolu', true),
        ('Mağaza İzmir - Alsancak', 'IZM-ALS-001', 'İzmir', 'Ege', true)
      ON CONFLICT (code) DO NOTHING;
    `);
        logger.info('✓ Sample stores created');

        // Insert default settings
        await sequelize.query(`
      INSERT INTO settings (key, value, value_type, description, is_system)
      VALUES 
        ('app_name', 'MağazaPano', 'string', 'Uygulama adı', true),
        ('app_version', '1.0.0', 'string', 'Uygulama versiyonu', true),
        ('default_playlist_duration', '300', 'integer', 'Varsayılan playlist süresi (saniye)', false),
        ('device_heartbeat_interval', '60', 'integer', 'Cihaz heartbeat aralığı (saniye)', false),
        ('max_upload_size', '524288000', 'integer', 'Max dosya boyutu (bytes)', false),
        ('enable_device_auto_approval', 'false', 'boolean', 'Cihaz otomatik onay', false)
      ON CONFLICT (key) DO NOTHING;
    `);
        logger.info('✓ Default settings created');

        logger.info('✅ Seed completed successfully');
        logger.info('');
        logger.info('📧 Default Login Credentials:');
        logger.info('   Admin: admin@magazapano.com / Admin123!');
        logger.info('   Editor: editor@magazapano.com / Admin123!');
        logger.info('');

    } catch (error) {
        logger.error('❌ Seed failed:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Run seed
runSeed();