const { execSync } = require('child_process');
const router = require('express').Router();
const log4js = require('log4js');

const k8sUtils = require('../k8s.utils');

const logger = log4js.getLogger('secret.controller');


router.get('/', async (req, res) => {
    try {
        const rows = await k8sUtils.runCommand(`kubectl get secret -n ${global.config.namespace}`);
        res.status(200).json({ rows, namespace: global.config.namespace });
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const content = execSync(`kubectl get secret -n ${global.config.namespace} ${req.params.id} -o json`).toString('utf-8');
        const configJSON = JSON.parse(content);
        res.status(200).json(configJSON);
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

module.exports = router;