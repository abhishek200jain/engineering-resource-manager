const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

// Manager can create a project
router.post('/', auth, role(['manager']), projectController.createProject);

// All users can view projects
router.get('/', auth, role(['manager', 'engineer']), projectController.getAllProjects);

// All users can view a specific project
router.get('/:id', auth, role(['manager', 'engineer']), projectController.getProjectById);

// Manager can update project
router.put('/:id', auth, role(['manager']), projectController.updateProject);

// Manager can delete project
router.delete('/:id', auth, role(['manager']), projectController.deleteProject);

module.exports = router; 