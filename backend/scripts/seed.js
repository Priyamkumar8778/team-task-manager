require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected. Seeding...');

  // Clean
  await Promise.all([User.deleteMany(), Project.deleteMany(), Task.deleteMany()]);

  // Users
  const admin = await User.create({ name: 'Alice Admin', email: 'admin@demo.com', password: 'password123', role: 'admin' });
  const m1 = await User.create({ name: 'Bob Member', email: 'bob@demo.com', password: 'password123' });
  const m2 = await User.create({ name: 'Carol Dev', email: 'carol@demo.com', password: 'password123' });

  // Projects
  const p1 = await Project.create({ name: 'Website Redesign', description: 'Revamp company website', owner: admin._id, members: [admin._id, m1._id, m2._id] });
  const p2 = await Project.create({ name: 'Mobile App', description: 'iOS/Android app', owner: admin._id, members: [admin._id, m2._id] });

  // Tasks
  const now = new Date();
  const past = (d) => new Date(now - d * 86400000);
  const future = (d) => new Date(+now + d * 86400000);

  await Task.create([
    { title: 'Design mockups', project: p1._id, createdBy: admin._id, assignedTo: m1._id, status: 'done', priority: 'high', dueDate: past(5) },
    { title: 'Build homepage', project: p1._id, createdBy: admin._id, assignedTo: m1._id, status: 'in-progress', priority: 'high', dueDate: future(3) },
    { title: 'SEO audit', project: p1._id, createdBy: admin._id, assignedTo: m2._id, status: 'todo', priority: 'low', dueDate: future(10) },
    { title: 'Overdue: Write copy', project: p1._id, createdBy: admin._id, assignedTo: m1._id, status: 'todo', priority: 'medium', dueDate: past(2) },
    { title: 'Setup React Native', project: p2._id, createdBy: admin._id, assignedTo: m2._id, status: 'done', priority: 'high', dueDate: past(10) },
    { title: 'Auth flow', project: p2._id, createdBy: admin._id, assignedTo: m2._id, status: 'in-progress', priority: 'high', dueDate: future(5) },
    { title: 'API integration', project: p2._id, createdBy: admin._id, status: 'todo', priority: 'medium', dueDate: future(7) },
    { title: 'Overdue: Push notifications', project: p2._id, createdBy: admin._id, assignedTo: m2._id, status: 'in-progress', priority: 'high', dueDate: past(1) },
  ]);

  console.log('\n✅ Seed complete!');
  console.log('admin@demo.com / password123 (admin)');
  console.log('bob@demo.com   / password123 (member)');
  console.log('carol@demo.com / password123 (member)');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });