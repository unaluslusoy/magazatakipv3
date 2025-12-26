const sequelize = require('../config/sequelize');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// GET - Tüm kullanıcıları getir
const getAllUsers = async(req, res) => {
    try {
        const [users] = await sequelize.query(`
      SELECT 
        id, email, name, role, is_active, 
        created_at, updated_at, last_login
      FROM users
      ORDER BY created_at DESC
    `);

        res.json({
            success: true,
            data: { users },
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcılar yüklenirken hata oluştu',
            error: error.message,
        });
    }
};

// GET - Tek kullanıcı getir
const getUserById = async(req, res) => {
    try {
        const { id } = req.params;

        const [users] = await sequelize.query(
            `SELECT id, email, name, role, is_active, created_at, updated_at, last_login
       FROM users WHERE id = $1`, { replacements: [id] }
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı',
            });
        }

        res.json({
            success: true,
            data: { user: users[0] },
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı yüklenirken hata oluştu',
            error: error.message,
        });
    }
};

// POST - Yeni kullanıcı oluştur
const createUser = async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const { email, password, name, role } = req.body;

        // Email kontrolü
        const [existing] = await sequelize.query(
            'SELECT id FROM users WHERE email = $1', { replacements: [email] }
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bu email adresi zaten kullanılıyor',
            });
        }

        // Şifre hash
        const hashedPassword = await bcrypt.hash(password, 10);

        const [users] = await sequelize.query(
            `INSERT INTO users (email, password, name, role, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, is_active, created_at`, {
                replacements: [
                    email,
                    hashedPassword,
                    name,
                    role || 'viewer',
                    true,
                ],
            }
        );

        res.status(201).json({
            success: true,
            message: 'Kullanıcı başarıyla oluşturuldu',
            data: { user: users[0] },
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı oluşturulurken hata oluştu',
            error: error.message,
        });
    }
};

// PUT - Kullanıcı güncelle
const updateUser = async(req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, is_active, password } = req.body;

        // Email değişiyorsa kontrol et
        if (email) {
            const [existing] = await sequelize.query(
                'SELECT id FROM users WHERE email = $1 AND id != $2', { replacements: [email, id] }
            );

            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Bu email adresi başka bir kullanıcı tarafından kullanılıyor',
                });
            }
        }

        let updateQuery = `
      UPDATE users SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        role = COALESCE($3, role),
        is_active = COALESCE($4, is_active),
        updated_at = CURRENT_TIMESTAMP
    `;
        let replacements = [name, email, role, is_active];

        // Şifre değişiyorsa
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery += `, password = $5 WHERE id = $6 RETURNING id, email, name, role, is_active, updated_at`;
            replacements.push(hashedPassword, id);
        } else {
            updateQuery += ` WHERE id = $5 RETURNING id, email, name, role, is_active, updated_at`;
            replacements.push(id);
        }

        const [users] = await sequelize.query(updateQuery, { replacements });

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı',
            });
        }

        res.json({
            success: true,
            message: 'Kullanıcı başarıyla güncellendi',
            data: { user: users[0] },
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı güncellenirken hata oluştu',
            error: error.message,
        });
    }
};

// DELETE - Kullanıcı sil
const deleteUser = async(req, res) => {
    try {
        const { id } = req.params;

        // Kendi hesabını silmeye çalışıyor mu?
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Kendi hesabınızı silemezsiniz',
            });
        }

        const [users] = await sequelize.query(
            'DELETE FROM users WHERE id = $1 RETURNING id, email, name', { replacements: [id] }
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı',
            });
        }

        res.json({
            success: true,
            message: 'Kullanıcı başarıyla silindi',
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı silinirken hata oluştu',
            error: error.message,
        });
    }
};

// PUT - Kullanıcı aktif/pasif durumunu değiştir
const toggleUserStatus = async(req, res) => {
    try {
        const { id } = req.params;

        // Kendi hesabını pasife çekmeye çalışıyor mu?
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Kendi hesabınızın durumunu değiştiremezsiniz',
            });
        }

        const [users] = await sequelize.query(
            `UPDATE users SET 
        is_active = NOT is_active,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, email, name, is_active`, { replacements: [id] }
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı',
            });
        }

        res.json({
            success: true,
            message: `Kullanıcı ${users[0].is_active ? 'aktif' : 'pasif'} edildi`,
            data: { user: users[0] },
        });
    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı durumu değiştirilirken hata oluştu',
            error: error.message,
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
};