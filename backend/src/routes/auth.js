const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../utils/validate');

router.post('/register', validate(schemas.register), ctrl.register);
router.post('/login', validate(schemas.login), ctrl.login);
router.get('/me', authenticate, ctrl.me);

module.exports = router;