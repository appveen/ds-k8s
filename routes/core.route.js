const router = require('express').Router({ mergeParams: true });
const log4js = require('log4js');

const SDK = require('../sdk');
const k8sUtils = require('../k8s.utils');
const coreData = require('../data/core.modules.json');

const logger = log4js.getLogger('core.controller');


router.get('/data', async (req, res) => {
    try {
        res.status(200).json({ rows: coreData, namespace: global.config.namespace });
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

router.get('/deployment', async (req, res) => {
    try {
        const rows = await k8sUtils.getDeployments(global.config.namespace);
        res.status(200).json({ rows, namespace: global.config.namespace });
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

router.get('/deployment/:id', async (req, res) => {
    try {
        const rows = await k8sUtils.getPods(global.config.namespace, req.params.id);
        const yamls = {};
        yamls.service = await k8sUtils.runCommandRaw(`kubectl --insecure-skip-tls-verify get svc -n ${global.config.namespace} ${req.params.id} -o yaml`);
        yamls.deployment = await k8sUtils.runCommandRaw(`kubectl --insecure-skip-tls-verify get deploy -n ${global.config.namespace} ${req.params.id} -o yaml`);
        res.status(200).json({ pods: rows, namespace: global.config.namespace, deployment: req.params.id, yamls });
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

module.exports = router;