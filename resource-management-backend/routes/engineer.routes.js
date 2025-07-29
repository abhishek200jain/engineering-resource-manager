const express = require('express');
const router = express.Router();
const engineerController = require('../controllers/engineerController');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

// Manager can view all engineers
router.get('/', auth, role(['manager' , 'engineer']), engineerController.getAllEngineers);

// Manager can check engineer capacity
router.get('/:id/capacity', auth, role(['manager']), engineerController.getEngineerCapacity);

module.exports = router; 