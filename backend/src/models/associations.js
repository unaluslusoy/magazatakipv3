/**
 * Model Associations
 * Tüm model ilişkileri buradan yönetilir
 */

const User = require('./User');
const Store = require('./Store');
const Content = require('./Content');
const Playlist = require('./Playlist');
const PlaylistContent = require('./PlaylistContent');
const Device = require('./Device');
const Schedule = require('./Schedule');
const Campaign = require('./Campaign');
const CampaignStore = require('./CampaignStore');

/**
 * İlişkileri kur
 */
function setupAssociations() {
    // User - Store ilişkisi
    User.belongsTo(Store, {
        foreignKey: 'store_id',
        as: 'store'
    });

    Store.hasMany(User, {
        foreignKey: 'store_id',
        as: 'users'
    });

    // Content - User ilişkisi
    Content.belongsTo(User, {
        foreignKey: 'created_by',
        as: 'creator'
    });

    User.hasMany(Content, {
        foreignKey: 'created_by',
        as: 'contents'
    });

    // Playlist - User ilişkisi
    Playlist.belongsTo(User, {
        foreignKey: 'created_by',
        as: 'creator'
    });

    User.hasMany(Playlist, {
        foreignKey: 'created_by',
        as: 'playlists'
    });

    // PlaylistContent - Playlist ilişkisi
    PlaylistContent.belongsTo(Playlist, {
        foreignKey: 'playlist_id',
        as: 'playlist'
    });

    Playlist.hasMany(PlaylistContent, {
        foreignKey: 'playlist_id',
        as: 'playlist_contents'
    });

    // PlaylistContent - Content ilişkisi
    PlaylistContent.belongsTo(Content, {
        foreignKey: 'content_id',
        as: 'content'
    });

    Content.hasMany(PlaylistContent, {
        foreignKey: 'content_id',
        as: 'playlist_usages'
    });

    // Playlist - Content Many-to-Many (through PlaylistContent)
    Playlist.belongsToMany(Content, {
        through: PlaylistContent,
        foreignKey: 'playlist_id',
        otherKey: 'content_id',
        as: 'contents'
    });

    Content.belongsToMany(Playlist, {
        through: PlaylistContent,
        foreignKey: 'content_id',
        otherKey: 'playlist_id',
        as: 'playlists'
    });

    // Device - Store ilişkisi
    Device.belongsTo(Store, {
        foreignKey: 'store_id',
        as: 'store'
    });

    Store.hasMany(Device, {
        foreignKey: 'store_id',
        as: 'devices'
    });

    // Device - Playlist ilişkisi
    Device.belongsTo(Playlist, {
        foreignKey: 'current_playlist_id',
        as: 'current_playlist'
    });

    Playlist.hasMany(Device, {
        foreignKey: 'current_playlist_id',
        as: 'assigned_devices'
    });

    // Schedule - Playlist ilişkisi
    Schedule.belongsTo(Playlist, {
        foreignKey: 'playlist_id',
        as: 'playlist'
    });

    Playlist.hasMany(Schedule, {
        foreignKey: 'playlist_id',
        as: 'schedules'
    });

    // Campaign - Playlist ilişkisi
    Campaign.belongsTo(Playlist, {
        foreignKey: 'playlist_id',
        as: 'playlist'
    });

    Playlist.hasMany(Campaign, {
        foreignKey: 'playlist_id',
        as: 'campaigns'
    });

    // Campaign - User ilişkisi
    Campaign.belongsTo(User, {
        foreignKey: 'created_by',
        as: 'creator'
    });

    User.hasMany(Campaign, {
        foreignKey: 'created_by',
        as: 'campaigns'
    });

    // Campaign - Store Many-to-Many (through CampaignStore)
    Campaign.belongsToMany(Store, {
        through: CampaignStore,
        foreignKey: 'campaign_id',
        otherKey: 'store_id',
        as: 'stores'
    });

    Store.belongsToMany(Campaign, {
        through: CampaignStore,
        foreignKey: 'store_id',
        otherKey: 'campaign_id',
        as: 'campaigns'
    });
}

module.exports = setupAssociations;