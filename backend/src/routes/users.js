const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
} = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation rules
const userValidation = [
    body('email').isEmail().withMessage('Geçerli bir email adresi giriniz'),
    body('name').notEmpty().withMessage('İsim zorunludur'),
    body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalıdır'),
    body('role')
    .optional()
    .isIn(['admin', 'manager', 'viewer'])
    .withMessage('Geçersiz rol'),
];

// Routes - Sadece admin erişebilir
router.get('/', authenticateToken, getAllUsers);
router.get('/:id', authenticateToken, getUserById);
router.post('/', authenticateToken, userValidation, createUser);
router.put('/:id', authenticateToken, updateUser);
router.put('/:id/toggle', authenticateToken, toggleUserStatus);
router.delete('/:id', authenticateToken, deleteUser);

module.exports = router;