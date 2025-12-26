/**
 * Device Model
 * Cihaz yönetimi
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Device = sequelize.define('Device', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    device_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [3, 50]
        }
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'stores',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'offline',
        allowNull: false,
        validate: {
            isIn: [
                ['online', 'offline', 'error', 'maintenance']
            ]
        }
    },
    last_heartbeat: {
        type: DataTypes.DATE,
        allowNull: true
    },
    current_playlist_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'playlists',
            key: 'id'
        }
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
        validate: {
            isIP: true
        }
    },
    mac_address: {
        type: DataTypes.STRING(17),
        allowNull: true
    },
    app_version: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    os_version: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    screen_resolution: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    free_storage_mb: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    layout_type: {
        type: DataTypes.STRING(20),
        defaultValue: 'single',
        allowNull: false,
        validate: {
            isIn: [
                ['single', 'split_vertical', 'split_horizontal', 'grid_2x2', 'pip']
            ]
        }
    },
    orientation: {
        type: DataTypes.STRING(20),
        defaultValue: 'landscape',
        allowNull: false,
        validate: {
            isIn: [
                ['landscape', 'portrait']
            ]
        }
    },
    volume_level: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
        allowNull: false,
        validate: {
            min: 0,
            max: 100
        }
    },
    brightness_level: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
        allowNull: false,
        validate: {
            min: 0,
            max: 100
        }
    },
    device_token: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    activation_code: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    activated_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
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
    tableName: 'devices',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Instance Methods
Device.prototype.toJSON = function() {
    const values = {...this.get() };
    // Hassas bilgileri gizle
    delete values.device_token;
    return values;
};

Device.prototype.isOnline = function() {
    if (!this.last_heartbeat) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(this.last_heartbeat) > fiveMinutesAgo;
};

Device.prototype.updateHeartbeat = async function() {
    this.last_heartbeat = new Date();
    this.status = 'online';
    await this.save();
};

// Class Methods
Device.findActive = function() {
    return this.findAll({
        where: { is_active: true },
        order: [
            ['name', 'ASC']
        ]
    });
};

Device.findOnline = function() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.findAll({
        where: {
            status: 'online',
            last_heartbeat: {
                [sequelize.Op.gte]: fiveMinutesAgo
            }
        }
    });
};

Device.findByStore = function(storeId) {
    return this.findAll({
        where: {
            store_id: storeId,
            is_active: true
        },
        order: [
            ['name', 'ASC']
        ]
    });
};

Device.findByCode = function(deviceCode) {
    return this.findOne({ where: { device_code: deviceCode } });
};

module.exports = Device;