const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

const schemas = {
  register: z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['admin', 'member']).optional(),
  }),
  login: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
  project: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
  }),
  task: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    status: z.enum(['todo', 'in-progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    assignedTo: z.string().optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
    project: z.string().optional(),
  }),
  taskUpdate: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    status: z.enum(['todo', 'in-progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    assignedTo: z.string().optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
  }),
};

module.exports = { validate, schemas };