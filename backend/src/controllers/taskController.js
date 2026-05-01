const Task = require('../models/Task');
const Project = require('../models/Project');

// Verify user has access to the project
const checkProjectAccess = async (projectId, userId, role) => {
  const project = await Project.findById(projectId);
  if (!project) return null;
  const isMember = project.members.some(m => m.equals(userId));
  return (isMember || role === 'admin') ? project : false;
};

// GET /api/tasks?project=&assignedTo=&status=
exports.getTasks = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.project) filter.project = req.query.project;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if (req.query.status) filter.status = req.query.status;

    // Non-admins: only see tasks in their projects
    if (req.user.role !== 'admin') {
      const projects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = projects.map(p => p._id);
      if (filter.project && !projectIds.some(id => id.equals(filter.project))) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (!filter.project) filter.project = { $in: projectIds };
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name')
      .sort('-createdAt');

    res.json(tasks);
  } catch (err) { next(err); }
};

// GET /api/tasks/dashboard — aggregated stats for current user
exports.getDashboard = async (req, res, next) => {
  try {
    const projects = await Project.find({ members: req.user._id }).select('_id');
    const projectIds = projects.map(p => p._id);

    const baseFiler = req.user.role === 'admin' ? {} : { project: { $in: projectIds } };

    const [all, myTasks, overdue] = await Promise.all([
      Task.aggregate([
        { $match: baseFiler },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.find({ ...baseFiler, assignedTo: req.user._id })
        .populate('project', 'name')
        .populate('assignedTo', 'name')
        .sort('dueDate')
        .limit(10),
      Task.find({
        ...baseFiler,
        status: { $ne: 'done' },
        dueDate: { $lt: new Date() },
      }).populate('project', 'name').populate('assignedTo', 'name email'),
    ]);

    const statusCounts = { todo: 0, 'in-progress': 0, done: 0 };
    all.forEach(({ _id, count }) => { statusCounts[_id] = count; });

    res.json({ statusCounts, myTasks, overdue });
  } catch (err) { next(err); }
};

// POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const project = await checkProjectAccess(req.body.project, req.user._id, req.user.role);
    if (!project) return res.status(403).json({ message: 'Access denied or project not found' });

    const task = await Task.create({ ...req.body, createdBy: req.user._id });
    await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
      { path: 'project', select: 'name' },
    ]);
    res.status(201).json(task);
  } catch (err) { next(err); }
};

// PATCH /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await checkProjectAccess(task.project, req.user._id, req.user.role);
    if (!project) return res.status(403).json({ message: 'Access denied' });

    Object.assign(task, req.body);
    await task.save();
    await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
      { path: 'project', select: 'name' },
    ]);
    res.json(task);
  } catch (err) { next(err); }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await checkProjectAccess(task.project, req.user._id, req.user.role);
    if (!project) return res.status(403).json({ message: 'Access denied' });

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) { next(err); }
};