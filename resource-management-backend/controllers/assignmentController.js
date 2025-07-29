const Assignment = require('../models/assignment.model');
const User = require('../models/user.model');

// GET /api/assignments
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('engineerId', 'name email')
      .populate('projectId', 'name');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/assignments
exports.createAssignment = async (req, res) => {
  try {
    const { engineerId, allocationPercentage } = req.body;

    // Validate over-allocation
    const engineer = await User.findById(engineerId);
    const currentAssignments = await Assignment.find({ engineerId });
    const total = currentAssignments.reduce((sum, a) => sum + a.allocationPercentage, 0);

    if (total + allocationPercentage > engineer.maxCapacity) {
      return res.status(400).json({
        message: 'Assignment exceeds engineer’s capacity',
      });
    }

    const assignment = new Assignment(req.body);
    const saved = await assignment.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/assignments/:id
exports.updateAssignment = async (req, res) => {
  try {
    const updated = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Assignment not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/assignments/:id
exports.deleteAssignment = async (req, res) => {
  try {
    const deleted = await Assignment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Assignment not found' });
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
