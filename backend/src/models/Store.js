/**
 * Store Model
 * Mağaza/Şube yönetimi
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Store = sequelize.define('Store', {
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
    code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [2, 20]
        }
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    region: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    manager_name: {
        type: DataTypes.STRING(100),
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
    tableName: 'stores',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Instance Methods
Store.prototype.toJSON = function() {
    const values = {...this.get() };
    return values;
};

// Class Methods
Store.findActive = function() {
    return this.findAll({
        where: { is_active: true },
        order: [
            ['name', 'ASC']
        ]
    });
};

Store.findByCode = function(code) {
    return this.findOne({ where: { code } });
};

Store.findByCity = function(city) {
    return this.findAll({
        where: { city, is_active: true },
        order: [
            ['name', 'ASC']
        ]
    });
};

module.exports = Store;