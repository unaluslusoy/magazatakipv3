const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/sequelize');

/**
 * User Model
 * Kullanıcı yönetimi için Sequelize modeli
 */
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: 'Geçerli bir email adresi giriniz'
            }
        }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash'
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'İsim boş olamaz'
            },
            len: {
                args: [2, 100],
                msg: 'İsim 2-100 karakter arasında olmalıdır'
            }
        }
    },
    role: {
        type: DataTypes.ENUM('super_admin', 'admin', 'editor', 'viewer'),
        allowNull: false,
        defaultValue: 'viewer',
        validate: {
            isIn: {
                args: [
                    ['super_admin', 'admin', 'editor', 'viewer']
                ],
                msg: 'Geçersiz rol'
            }
        }
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'store_id',
        references: {
            model: 'stores',
            key: 'id'
        }
    },
    avatar_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'avatar_url'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    },
    last_login_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login_at'
    },
    password_changed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'password_changed_at'
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
    tableName: 'users',
    timestamps: false, // Manuel olarak created_at/updated_at yönetiyoruz
    underscored: true,
    indexes: [
        { fields: ['email'] },
        { fields: ['role'] },
        { fields: ['store_id'] }
    ],
    hooks: {
        // Password hash'i oluştur
        beforeCreate: async(user) => {
            if (user.password_hash) {
                user.password_hash = await bcrypt.hash(user.password_hash, 10);
            }
        },
        // Password değiştiğinde hash'i güncelle
        beforeUpdate: async(user) => {
            if (user.changed('password_hash')) {
                user.password_hash = await bcrypt.hash(user.password_hash, 10);
                user.password_changed_at = new Date();
            }
        }
    }
});

/**
 * Instance Methods
 */

// Password doğrulama
User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
};

// JSON'a dönüştürürken password'u gizle
User.prototype.toJSON = function() {
    const values = {...this.get() };
    delete values.password_hash;
    return values;
};

// Son giriş zamanını güncelle
User.prototype.updateLastLogin = async function() {
    this.last_login_at = new Date();
    await this.save();
};

/**
 * Class Methods
 */

// Email ile kullanıcı bul
User.findByEmail = async function(email) {
    return await User.findOne({
        where: { email: email.toLowerCase() }
    });
};

// Aktif kullanıcıları getir
User.findActive = async function(options = {}) {
    return await User.findAll({
        where: { is_active: true },
        ...options
    });
};

// Rol bazlı kullanıcıları getir
User.findByRole = async function(role, options = {}) {
    return await User.findAll({
        where: { role, is_active: true },
        ...options
    });
};

// Mağazaya göre kullanıcıları getir
User.findByStore = async function(storeId, options = {}) {
    return await User.findAll({
        where: { store_id: storeId, is_active: true },
        ...options
    });
};

module.exports = User;