const router = require('express').Router();
const log4js = require('log4js');

const SDK = require('../sdk');
const k8sUtils = require('../k8s.utils');

const logger = log4js.getLogger('app.controller');

router.get('/', async (req, res) => {
    try {
        const apps = await SDK.getDataStack().ListApps();
        res.status(200).json({ apps: apps.map(e => e.app), namespace: global.config.namespace });
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const app = await SDK.getDataStack().App(req.params.id);
        const dataServices = await app.ListDataServices({ select: 'name,status,deployment,app,deploymentName', count: -1, sort: 'name', filter: { app: req.params.id } });
        const service = dataServices.map(e => e.data);
        res.status(200).json({ app: app.app, namespace: global.config.namespace, dataServices: service });
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

router.get('/:id/deployment/:dataService', async (req, res) => {
    try {
        const app = await SDK.getDataStack().App(req.params.id);
        const dataService = await app.DataService(req.params.dataService);
        const yamls = await dataService.Yamls();
        dataService.yamls = yamls;
        const records = await k8sUtils.getPods(global.config.namespace + '-' + dataService.data.deploymentNamespace, dataService.data.deploymentName);
        dataService.pods = records;
        dataService.namespace = global.config.namespace;
        res.status(200).json(dataService);
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

module.exports = router;