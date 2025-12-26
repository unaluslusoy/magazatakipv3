/**
 * PlaylistContent Model
 * Playlist-Content ilişki modeli
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const PlaylistContent = sequelize.define('PlaylistContent', {
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
    content_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'contents',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    duration_override: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'NULL = içerik süresi kullanılır'
    },
    transition_type: {
        type: DataTypes.STRING(20),
        defaultValue: 'fade',
        allowNull: false,
        validate: {
            isIn: [
                ['fade', 'slide', 'zoom', 'none']
            ]
        }
    },
    settings: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: 'Ek ayarlar'
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    }
}, {
    tableName: 'playlist_contents',
    timestamps: false,
    indexes: [
        { fields: ['playlist_id'] },
        { fields: ['playlist_id', 'position'] },
        {
            fields: ['playlist_id', 'content_id'],
            unique: true,
            name: 'idx_playlist_contents_unique'
        }
    ]
});

// Instance Methods
PlaylistContent.prototype.toJSON = function() {
    const values = {...this.get() };
    return values;
};

// Class Methods
PlaylistContent.findByPlaylist = function(playlistId) {
    return this.findAll({
        where: { playlist_id: playlistId },
        order: [
            ['position', 'ASC']
        ]
    });
};

PlaylistContent.reorderPositions = async function(playlistId, contentIds) {
    const updatePromises = contentIds.map((contentId, index) =>
        this.update({ position: index }, {
            where: {
                playlist_id: playlistId,
                content_id: contentId
            }
        })
    );
    return Promise.all(updatePromises);
};

module.exports = PlaylistContent;