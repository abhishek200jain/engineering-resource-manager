const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

// Manager can create an assignment
router.post('/', auth, role(['manager']), assignmentController.createAssignment);

// Manager can view all assignments
router.get('/', auth, role(['manager' , 'engineer']), assignmentController.getAllAssignments);

// Manager can update an assignment
router.put('/:id', auth, role(['manager']), assignmentController.updateAssignment);

// Manager can delete an assignment
router.delete('/:id', auth, role(['manager']), assignmentController.deleteAssignment);

module.exports = router;
