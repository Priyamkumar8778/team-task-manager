const User = require('../models/User');

// GET /api/users — admin only, for member management
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('name email role createdAt').sort('name');
    res.json(users);
  } catch (err) { next(err); }
};