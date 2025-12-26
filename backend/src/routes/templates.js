const express = require('express');
const router = express.Router();
const {
    getAllTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate
} = require('../controllers/templateController');
const { authenticateToken } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation rules
const templateValidation = [
    body('name').notEmpty().withMessage('Template adı zorunludur'),
    body('template_type')
    .isIn(['slider', 'banner', 'countdown', 'weather', 'news', 'custom'])
    .withMessage('Geçersiz template tipi'),
    body('category')
    .optional()
    .isIn(['promotional', 'informational', 'interactive', 'dynamic'])
    .withMessage('Geçersiz kategori'),
];

// Routes
router.get('/', authenticateToken, getAllTemplates);
router.get('/:id', authenticateToken, getTemplateById);
router.post('/', authenticateToken, templateValidation, createTemplate);
router.put('/:id', authenticateToken, updateTemplate);
router.delete('/:id', authenticateToken, deleteTemplate);
router.post('/:id/duplicate', authenticateToken, duplicateTemplate);

module.exports = router;