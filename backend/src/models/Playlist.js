/**
 * Playlist Model
 * Playlist yönetimi
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Playlist = sequelize.define('Playlist', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    duration_seconds: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'Hesaplanan toplam süre'
    },
    is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    priority: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        allowNull: false,
        validate: {
            min: 1,
            max: 100
        },
        comment: '1-100, yüksek = öncelikli'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
    }
}, {
    tableName: 'playlists',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Instance Methods
Playlist.prototype.toJSON = function() {
    const values = {...this.get() };
    return values;
};

// Class Methods
Playlist.findActive = function() {
    return this.findAll({
        where: { is_active: true },
        order: [
            ['priority', 'DESC'],
            ['name', 'ASC']
        ]
    });
};

Playlist.findDefault = function() {
    return this.findOne({
        where: {
            is_default: true,
            is_active: true
        }
    });
};

Playlist.findByPriority = function(minPriority = 1) {
    return this.findAll({
        where: {
            is_active: true,
            priority: {
                [sequelize.Op.gte]: minPriority }
        },
        order: [
            ['priority', 'DESC']
        ]
    });
};

module.exports = Playlist;