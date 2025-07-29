const express = require('express');
const auth = require('../middlewares/auth.middleware');
const authController = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/profile
router.get('/profile', auth, authController.getProfile);

// PUT /api/auth/profile
router.put('/profile', auth, authController.updateProfile);

module.exports = router; 