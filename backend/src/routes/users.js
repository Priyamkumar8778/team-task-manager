const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);
router.get('/', requireRole('admin'), ctrl.getUsers);

module.exports = router;