const router = require('express').Router();
const ctrl = require('../controllers/projectController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate, schemas } = require('../utils/validate');

router.use(authenticate);

router.get('/', ctrl.getProjects);
router.get('/:id', ctrl.getProject);
router.post('/', requireRole('admin'), validate(schemas.project), ctrl.createProject);
router.delete('/:id', requireRole('admin'), ctrl.deleteProject);
router.post('/:id/members', requireRole('admin'), ctrl.addMember);
router.delete('/:id/members/:userId', requireRole('admin'), ctrl.removeMember);

module.exports = router;