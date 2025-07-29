const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/user.model');
const Project = require('../models/project.model');
const Assignment = require('../models/assignment.model');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("✅ Connected to MongoDB");

  // 1. Cleanup
  await User.deleteMany();
  await Project.deleteMany();
  await Assignment.deleteMany();

  const hashedPassword = await bcrypt.hash("test123", 10);

  // 2. Seed Engineers
  const engineers = await User.insertMany([
    {
      email: "john@example.com",
      name: "John Doe",
      password: hashedPassword,
      role: "engineer",
      skills: ["React", "Node.js"],
      seniority: "mid",
      maxCapacity: 100,
      department: "Frontend"
    },
    {
      email: "sara@example.com",
      name: "Sara Smith",
      password: hashedPassword,
      role: "engineer",
      skills: ["Python", "Node.js"],
      seniority: "senior",
      maxCapacity: 100,
      department: "Backend"
    },
    {
      email: "emma@example.com",
      name: "Emma Johnson",
      password: hashedPassword,
      role: "engineer",
      skills: ["React", "Python"],
      seniority: "junior",
      maxCapacity: 50,
      department: "Data"
    },
    {
      email: "li@example.com",
      name: "Li Wei",
      password: hashedPassword,
      role: "engineer",
      skills: ["React", "Node.js"],
      seniority: "mid",
      maxCapacity: 100,
      department: "Frontend"
    }
  ]);

  // 3. Seed Manager
  const manager = await User.create({
    email: "manager@example.com",
    name: "Manager Mike",
    password: hashedPassword,
    role: "manager",
    skills: [],
    seniority: "senior",
    maxCapacity: 100,
    department: "Management"
  });

  // 4. Seed Projects
  const projects = await Project.insertMany([
    {
      name: "Website Revamp",
      description: "Modernizing frontend with React and Tailwind",
      startDate: new Date(),
      endDate: new Date(Date.now() + 20 * 86400000),
      requiredSkills: ["React"],
      teamSize: 2,
      status: "active",
      managerId: manager._id
    },
    {
      name: "API Refactoring",
      description: "Backend upgrade using Node.js best practices",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 86400000),
      requiredSkills: ["Node.js"],
      teamSize: 3,
      status: "planning",
      managerId: manager._id
    },
    {
      name: "ML Dashboard",
      description: "Data visualization for ML pipelines",
      startDate: new Date(),
      endDate: new Date(Date.now() + 25 * 86400000),
      requiredSkills: ["Python"],
      teamSize: 2,
      status: "active",
      managerId: manager._id
    },
    {
      name: "Internal Tool",
      description: "React + Python-powered reporting tool",
      startDate: new Date(),
      endDate: new Date(Date.now() + 40 * 86400000),
      requiredSkills: ["React", "Python"],
      teamSize: 3,
      status: "completed",
      managerId: manager._id
    }
  ]);

  // 5. Seed Assignments (6–8 entries)
  await Assignment.insertMany([
    {
      engineerId: engineers[0]._id,
      projectId: projects[0]._id,
      allocationPercentage: 60,
      startDate: new Date(),
      endDate: new Date(Date.now() + 10 * 86400000),
      role: "Developer"
    },
    {
      engineerId: engineers[1]._id,
      projectId: projects[1]._id,
      allocationPercentage: 100,
      startDate: new Date(),
      endDate: new Date(Date.now() + 20 * 86400000),
      role: "Tech Lead"
    },
    {
      engineerId: engineers[2]._id,
      projectId: projects[2]._id,
      allocationPercentage: 50,
      startDate: new Date(),
      endDate: new Date(Date.now() + 15 * 86400000),
      role: "Junior Dev"
    },
    {
      engineerId: engineers[3]._id,
      projectId: projects[0]._id,
      allocationPercentage: 40,
      startDate: new Date(),
      endDate: new Date(Date.now() + 10 * 86400000),
      role: "Developer"
    },
    {
      engineerId: engineers[0]._id,
      projectId: projects[3]._id,
      allocationPercentage: 20,
      startDate: new Date(),
      endDate: new Date(Date.now() + 25 * 86400000),
      role: "Tester"
    },
    {
      engineerId: engineers[1]._id,
      projectId: projects[2]._id,
      allocationPercentage: 50,
      startDate: new Date(),
      endDate: new Date(Date.now() + 15 * 86400000),
      role: "Support"
    }
  ]);

  console.log("✅ Sample data seeded successfully!");
  process.exit();
}).catch(err => {
  console.error("❌ Seeding error:", err);
  process.exit(1);
});
