const mongoose = require('mongoose');

// User schema for both engineers and managers
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  password: String,
  role: { type: String, enum: ['engineer', 'manager'], required: true },
  skills: [String], // Technical skills for engineers
  seniority: { type: String, enum: ['junior', 'mid', 'senior'] },
  maxCapacity: Number, // Maximum workload capacity in percentage
  department: String,
});

module.exports = mongoose.model('User', userSchema); 