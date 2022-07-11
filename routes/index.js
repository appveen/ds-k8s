const router = require('express').Router();

router.use('/config', require('./config.route'));
router.use('/app', require('./app.route'));
router.use('/data-service', require('./data-service.route'));
router.use('/faas', require('./faas.route'));
router.use('/config-map', require('./config-map.route'));
router.use('/secret', require('./secret.route'));
router.use('/core', require('./core.route'));
router.use('/k8s/:namespace', require('./k8s.route'));

module.exports = router;