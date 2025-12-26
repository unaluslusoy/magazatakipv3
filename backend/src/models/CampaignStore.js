/**
 * CampaignStore Model
 * Kampanya-Mağaza ilişki tablosu
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const CampaignStore = sequelize.define('CampaignStore', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    campaign_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'campaigns',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'stores',
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'campaign_stores',
    timestamps: false
});

module.exports = CampaignStore;