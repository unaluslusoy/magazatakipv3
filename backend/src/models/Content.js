const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * Content Model
 * İçerik yönetimi (video, resim, slider, ticker, duyuru)
 */
const Content = sequelize.define('Content', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'İçerik adı boş olamaz' },
            len: { args: [2, 150], msg: 'İçerik adı 2-150 karakter arasında olmalıdır' }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('video', 'image', 'slider', 'ticker', 'announcement'),
        allowNull: false,
        validate: {
            isIn: {
                args: [
                    ['video', 'image', 'slider', 'ticker', 'announcement']
                ],
                msg: 'Geçersiz içerik tipi'
            }
        }
    },
    // Dosya bilgileri
    file_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'file_url'
    },
    file_path: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'file_path'
    },
    thumbnail_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'thumbnail_url'
    },
    file_size: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'file_size'
    },
    mime_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'mime_type'
    },
    checksum: {
        type: DataTypes.STRING(64),
        allowNull: true
    },
    // Video/Görsel metadata
    duration_seconds: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'duration_seconds'
    },
    resolution: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    // Slider özel alanları
    slider_settings: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'slider_settings'
    },
    // Ticker özel alanları
    ticker_text: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'ticker_text'
    },
    ticker_settings: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'ticker_settings'
    },
    // Duyuru özel alanları
    announcement_title: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'announcement_title'
    },
    announcement_type: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'announcement_type'
    },
    announcement_settings: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'announcement_settings'
    },
    // Genel alanlar
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: []
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'active',
        validate: {
            isIn: {
                args: [
                    ['active', 'inactive', 'draft', 'archived']
                ],
                msg: 'Geçersiz durum'
            }
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'created_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
    }
}, {
    tableName: 'contents',
    timestamps: false,
    underscored: true,
    indexes: [
        { fields: ['type'] },
        { fields: ['status'] },
        { fields: ['is_active'] },
        { fields: ['created_at'] }
    ]
});

/**
 * Instance Methods
 */

// JSON'a dönüştürme
Content.prototype.toJSON = function() {
    const values = {...this.get() };
    // file_path gibi dahili alanları gizle
    if (values.file_path) {
        delete values.file_path;
    }
    return values;
};

/**
 * Class Methods
 */

// Tip bazlı içerikleri getir
Content.findByType = async function(type, options = {}) {
    return await Content.findAll({
        where: { type, is_active: true },
        order: [
            ['created_at', 'DESC']
        ],
        ...options
    });
};

// Aktif içerikleri getir
Content.findActive = async function(options = {}) {
    return await Content.findAll({
        where: { is_active: true, status: 'active' },
        order: [
            ['created_at', 'DESC']
        ],
        ...options
    });
};

// Tag ile ara
Content.findByTag = async function(tag, options = {}) {
    return await Content.findAll({
        where: {
            tags: {
                [sequelize.Sequelize.Op.contains]: [tag] },
            is_active: true
        },
        ...options
    });
};

module.exports = Content;