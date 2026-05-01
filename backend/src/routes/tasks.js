const router = require('express').Router();
const ctrl = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../utils/validate');

router.use(authenticate);

router.get('/dashboard', ctrl.getDashboard);
router.get('/', ctrl.getTasks);
router.post('/', validate(schemas.task), ctrl.createTask);
router.patch('/:id', validate(schemas.taskUpdate), ctrl.updateTask);
router.delete('/:id', ctrl.deleteTask);

module.exports = router;