const sequelize = require('../config/sequelize');
const { validationResult } = require('express-validator');

// GET - Tüm template'leri getir
const getAllTemplates = async(req, res) => {
    try {
        const [templates] = await sequelize.query(`
      SELECT 
        t.*,
        u.name as created_by_name
      FROM templates t
      LEFT JOIN users u ON t.created_by = u.id
      ORDER BY t.created_at DESC
    `);

        res.json({
            success: true,
            data: {
                templates,
            },
        });
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({
            success: false,
            message: 'Template\'ler yüklenirken hata oluştu',
            error: error.message,
        });
    }
};

// GET - Tek template getir
const getTemplateById = async(req, res) => {
    try {
        const { id } = req.params;

        const [templates] = await sequelize.query(
            `SELECT t.*, u.name as created_by_name
       FROM templates t
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.id = $1`, { replacements: [id] }
        );

        if (templates.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Template bulunamadı',
            });
        }

        res.json({
            success: true,
            data: {
                template: templates[0],
            },
        });
    } catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({
            success: false,
            message: 'Template yüklenirken hata oluştu',
            error: error.message,
        });
    }
};

// POST - Yeni template oluştur
const createTemplate = async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            });
        }

        const {
            name,
            template_type,
            category,
            preview_image,
            config,
            layers,
            animations,
            duration,
            is_active,
        } = req.body;

        const [templates] = await sequelize.query(
            `INSERT INTO templates (
        name, template_type, category, preview_image, 
        config, layers, animations, duration, 
        is_active, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`, {
                replacements: [
                    name,
                    template_type,
                    category,
                    preview_image,
                    JSON.stringify(config || {}),
                    JSON.stringify(layers || []),
                    JSON.stringify(animations || []),
                    duration || 10,
                    is_active !== false,
                    req.user.id,
                ]
            }
        );

        res.status(201).json({
            success: true,
            message: 'Template başarıyla oluşturuldu',
            data: {
                template: templates[0],
            },
        });
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({
            success: false,
            message: 'Template oluşturulurken hata oluştu',
            error: error.message,
        });
    }
};

// PUT - Template güncelle
const updateTemplate = async(req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            template_type,
            category,
            preview_image,
            config,
            layers,
            animations,
            duration,
            is_active,
        } = req.body;

        const [templates] = await sequelize.query(
            `UPDATE templates SET
        name = COALESCE($1, name),
        template_type = COALESCE($2, template_type),
        category = COALESCE($3, category),
        preview_image = COALESCE($4, preview_image),
        config = COALESCE($5, config),
        layers = COALESCE($6, layers),
        animations = COALESCE($7, animations),
        duration = COALESCE($8, duration),
        is_active = COALESCE($9, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *`, {
                replacements: [
                    name,
                    template_type,
                    category,
                    preview_image,
                    config ? JSON.stringify(config) : null,
                    layers ? JSON.stringify(layers) : null,
                    animations ? JSON.stringify(animations) : null,
                    duration,
                    is_active,
                    id,
                ]
            }
        );

        if (templates.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Template bulunamadı',
            });
        }

        res.json({
            success: true,
            message: 'Template başarıyla güncellendi',
            data: {
                template: templates[0],
            },
        });
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({
            success: false,
            message: 'Template güncellenirken hata oluştu',
            error: error.message,
        });
    }
};

// DELETE - Template sil
const deleteTemplate = async(req, res) => {
    try {
        const { id } = req.params;

        const [templates] = await sequelize.query(
            'DELETE FROM templates WHERE id = $1 RETURNING *', { replacements: [id] }
        );

        if (templates.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Template bulunamadı',
            });
        }

        res.json({
            success: true,
            message: 'Template başarıyla silindi',
        });
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({
            success: false,
            message: 'Template silinirken hata oluştu',
            error: error.message,
        });
    }
};

// POST - Template'i duplicate et
const duplicateTemplate = async(req, res) => {
    try {
        const { id } = req.params;

        // Önce original template'i al
        const [original] = await sequelize.query(
            'SELECT * FROM templates WHERE id = $1', { replacements: [id] }
        );

        if (original.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Template bulunamadı',
            });
        }

        const template = original[0];

        // Yeni template oluştur
        const [newTemplates] = await sequelize.query(
            `INSERT INTO templates (
        name, template_type, category, preview_image,
        config, layers, animations, duration, 
        is_active, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`, {
                replacements: [
                    `${template.name} (Kopya)`,
                    template.template_type,
                    template.category,
                    template.preview_image,
                    template.config,
                    template.layers,
                    template.animations,
                    template.duration,
                    template.is_active,
                    req.user.id,
                ]
            }
        );

        res.status(201).json({
            success: true,
            message: 'Template başarıyla kopyalandı',
            data: {
                template: newTemplates[0],
            },
        });
    } catch (error) {
        console.error('Error duplicating template:', error);
        res.status(500).json({
            success: false,
            message: 'Template kopyalanırken hata oluştu',
            error: error.message,
        });
    }
};

module.exports = {
    getAllTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
};