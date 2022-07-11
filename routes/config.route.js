const os = require('os');
const fs = require('fs');
const path = require('path');
const router = require('express').Router();
const log4js = require('log4js');

const SDK = require('../sdk');

const logger = log4js.getLogger('config.controller');
const homeDir = path.join(os.homedir(), '.ds-k9s');

router.get('/', async (req, res) => {
    try {
        let json = {};
        if (fs.existsSync(path.join(homeDir, 'config.json'))) {
            json = JSON.parse(fs.readFileSync(path.join(homeDir, 'config.json')));
            if (json && Object.keys(json).length == 4) {
                global.config = json;
                await SDK.authenticate(json);
                return res.status(200).json(json);
            }
        }
        res.status(404).json({ message: 'Configuaration not set' });
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

router.post('/', async (req, res) => {
    try {
        fs.writeFileSync(path.join(homeDir, 'config.json'), JSON.stringify(req.body, null, 4));
        global.config = req.body;
        await SDK.authenticate(req.body);
        res.status(200).json({ message: 'Configuaration set' });
    } catch (err) {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

module.exports = router;