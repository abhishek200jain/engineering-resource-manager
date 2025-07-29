const User = require('../models/user.model');
const Assignment = require('../models/assignment.model');

// GET /api/engineers
exports.getAllEngineers = async (req, res) => {
  try {
    const engineers = await User.find({ role: 'engineer' });
    res.json(engineers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/engineers/:id/capacity
exports.getEngineerCapacity = async (req, res) => {
  try {
    const engineerId = req.params.id;
    const engineer = await User.findById(engineerId);
    if (!engineer) {
      return res.status(404).json({ message: 'Engineer not found' });
    }

    const assignments = await Assignment.find({ engineerId });
    const totalAllocated = assignments.reduce((sum, a) => sum + a.allocationPercentage, 0);
    const available = engineer.maxCapacity - totalAllocated;

    res.json({
      engineerId,
      name: engineer.name,
      maxCapacity: engineer.maxCapacity,
      allocated: totalAllocated,
      available,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
