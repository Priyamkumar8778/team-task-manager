const Project = require('../models/Project');
const Task = require('../models/Task');

// GET /api/projects — list projects user belongs to
exports.getProjects = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin'
      ? {}
      : { members: req.user._id };
    const projects = await Project.find(query)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort('-createdAt');
    res.json(projects);
  } catch (err) { next(err); }
};

// GET /api/projects/:id
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // Members + admins can view
    const isMember = project.members.some(m => m._id.equals(req.user._id));
    if (!isMember && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(project);
  } catch (err) { next(err); }
};

// POST /api/projects — admin only
exports.createProject = async (req, res, next) => {
  try {
    const project = await Project.create({ ...req.body, owner: req.user._id });
    await project.populate('owner', 'name email');
    res.status(201).json(project);
  } catch (err) { next(err); }
};

// DELETE /api/projects/:id — admin only
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // Cascade delete tasks
    await Task.deleteMany({ project: req.params.id });
    res.json({ message: 'Project deleted' });
  } catch (err) { next(err); }
};

// POST /api/projects/:id/members — add member (admin only)
exports.addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) { next(err); }
};

// DELETE /api/projects/:id/members/:userId — remove member (admin only)
exports.removeMember = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: req.params.userId } },
      { new: true }
    ).populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) { next(err); }
};