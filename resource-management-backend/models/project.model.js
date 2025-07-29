const mongoose = require('mongoose');

// Project schema for resource management
const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  startDate: Date,
  endDate: Date,
  requiredSkills: [String], // Skills needed for the project
  teamSize: Number,
  status: { type: String, enum: ['planning', 'active', 'completed'] },
  managerId: mongoose.Schema.Types.ObjectId,
});

module.exports = mongoose.model('Project', projectSchema); 