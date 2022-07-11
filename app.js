const os = require('os');
const fs = require('fs');
const path = require('path');
const express = require('express');
const log4js = require('log4js');
const open = require('open');
const { program } = require('commander');
const { execSync } = require('child_process');

const SDK = require('./sdk');

const tempFileDir = path.join(os.tmpdir(), 'ds-k9s');
const homeDir = path.join(os.homedir(), '.ds-k9s');


program
    .option('--port <port>', 'Server Port')
    .option('--log-level <string>', 'Log Level')
    .option('--reset', 'Reset Tool');

program.parse(process.argv);

const options = program.opts();
let PORT = process.env.PORT || 3000;
let LOG_LEVEL = process.env.LOG_LEVEL || 'info';

if (options && options.port) {
    PORT = options.port;
}
if (options && options.logLevel) {
    LOG_LEVEL = options.logLevel;
}

if (options && options.reset) {
    execSync(`rm -rf ${homeDir}`);
}

fs.mkdirSync(tempFileDir, { recursive: true });
if (!fs.existsSync(homeDir)) {
    fs.mkdirSync(homeDir, { recursive: true });
}

log4js.configure({
    appenders: { 'out': { type: 'stdout' }, file: { type: 'multiFile', base: tempFileDir, property: 'categoryName', extension: '.log', maxLogSize: 10485760, backups: 3, compress: true } },
    categories: { default: { appenders: ['out', 'file'], level: LOG_LEVEL } }
});

const app = express();
const logger = log4js.getLogger('ds-k8s');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    logger.info(req.method, req.headers['x-forwarded-for'] || 'localhost', req.path, req.query);
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api', require('./routes'));


app.listen(PORT, async () => {
    logger.info('Server is listening on port', PORT);
    let json = {};
    if (fs.existsSync(path.join(homeDir, 'config.json'))) {
        json = JSON.parse(fs.readFileSync(path.join(homeDir, 'config.json')));
        if (json && Object.keys(json).length == 4) {
            global.config = json;
            await SDK.authenticate(json);
        }
    }
    // open('http://localhost:' + PORT + '/');
});