const router = require('express').Router({ mergeParams: true });
const log4js = require('log4js');

const SDK = require('../sdk');
const k8sUtils = require('../k8s.utils');

const logger = log4js.getLogger('data-service.controller');


router.get('/pod', async (req, res) => {
    try {
        const rows = await k8sUtils.getPods(req.params.namespace);
        res.status(200).json({ rows });
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

router.get('/pod/:id', async (req, res) => {
    try {
        const rows = await k8sUtils.getPods(req.params.namespace, req.params.id);
        res.status(200).json({ rows });
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

router.delete('/pod/:id', async (req, res) => {
    try {
        
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

module.exports = router;