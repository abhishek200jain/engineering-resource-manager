const mongoose = require('mongoose');

// Assignment schema for tracking engineer allocations to projects
const assignmentSchema = new mongoose.Schema({
  engineerId: mongoose.Schema.Types.ObjectId,
  projectId: mongoose.Schema.Types.ObjectId,
  allocationPercentage: Number,
  startDate: Date,
  endDate: Date,
  role: String, // Engineer's role in the project
});

module.exports = mongoose.model('Assignment', assignmentSchema); 