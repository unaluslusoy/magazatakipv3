/**
 * Schedule Model
 * Playlist zamanlama yönetimi
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Schedule = sequelize.define('Schedule', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    playlist_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'playlists',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    schedule_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'always',
        validate: {
            isIn: [
                ['always', 'date_range', 'daily', 'weekly', 'custom']
            ]
        }
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: true
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: true
    },
    days_of_week: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: true,
        validate: {
            isValidDays(value) {
                if (value && Array.isArray(value)) {
                    const valid = value.every(day => day >= 1 && day <= 7);
                    if (!valid) {
                        throw new Error('Günler 1-7 arasında olmalıdır (1=Pazartesi, 7=Pazar)');
                    }
                }
            }
        }
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
    tableName: 'schedules',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Instance Methods
Schedule.prototype.isCurrentlyActive = function() {
    if (!this.is_active) return false;

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 8);
    const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // 1=Pazartesi, 7=Pazar

    // Always type
    if (this.schedule_type === 'always') {
        return true;
    }

    // Date range check
    if (this.start_date && currentDate < this.start_date) return false;
    if (this.end_date && currentDate > this.end_date) return false;

    // Time range check
    if (this.start_time && currentTime < this.start_time) return false;
    if (this.end_time && currentTime > this.end_time) return false;

    // Weekly check
    if (this.schedule_type === 'weekly' && this.days_of_week) {
        if (!this.days_of_week.includes(currentDay)) return false;
    }

    return true;
};

// Class Methods
Schedule.findActive = function() {
    return this.findAll({
        where: { is_active: true },
        order: [
            ['created_at', 'DESC']
        ]
    });
};

Schedule.findByPlaylist = function(playlistId) {
    return this.findAll({
        where: { playlist_id: playlistId },
        order: [
            ['created_at', 'DESC']
        ]
    });
};

Schedule.findCurrentlyActive = async function() {
    const schedules = await this.findActive();
    return schedules.filter(s => s.isCurrentlyActive());
};

module.exports = Schedule;