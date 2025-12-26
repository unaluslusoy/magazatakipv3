/**
 * Campaign Model
 * Kampanya yönetimi
 */

const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/sequelize');

const Campaign = sequelize.define('Campaign', {
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
    playlist_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'playlists',
            key: 'id'
        },
        onDelete: 'SET NULL'
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isAfterStartDate(value) {
                if (this.start_date && value < this.start_date) {
                    throw new Error('Bitiş tarihi başlangıç tarihinden önce olamaz');
                }
            }
        }
    },
    priority: {
        type: DataTypes.INTEGER,
        defaultValue: 60,
        allowNull: false,
        validate: {
            min: 1,
            max: 100
        }
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'pending',
        allowNull: false,
        validate: {
            isIn: [
                ['pending', 'active', 'completed', 'cancelled']
            ]
        }
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
    tableName: 'campaigns',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Instance Methods
Campaign.prototype.isActive = function() {
    if (this.status !== 'active') return false;

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];

    return currentDate >= this.start_date && currentDate <= this.end_date;
};

Campaign.prototype.updateStatus = async function() {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];

    if (currentDate < this.start_date && this.status === 'pending') {
        return; // Henüz başlamadı
    }

    if (currentDate >= this.start_date && currentDate <= this.end_date && this.status === 'pending') {
        this.status = 'active';
        await this.save();
    }

    if (currentDate > this.end_date && this.status === 'active') {
        this.status = 'completed';
        await this.save();
    }
};

// Class Methods
Campaign.findActive = function() {
    return this.findAll({
        where: { status: 'active' },
        order: [
            ['priority', 'DESC'],
            ['start_date', 'ASC']
        ]
    });
};

Campaign.findByStatus = function(status) {
    return this.findAll({
        where: { status },
        order: [
            ['created_at', 'DESC']
        ]
    });
};

Campaign.findUpcoming = function() {
    const today = new Date().toISOString().split('T')[0];
    return this.findAll({
        where: {
            status: 'pending',
            start_date: {
                [Op.gt]: today
            }
        },
        order: [
            ['start_date', 'ASC']
        ]
    });
};

module.exports = Campaign;