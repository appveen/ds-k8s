const log4js = require('log4js');
const SDK = require('@appveen/ds-sdk');

const logger = log4js.getLogger('SDK');
let DataStack;
let isInitailized = false;

async function authenticate(data) {
    try {
        DataStack = await SDK.authenticateByCredentials(data);
        isInitailized = true;
    } catch (err) {
        logger.error(err);
    }
}

function getDataStack() {
    return DataStack;
}

module.exports = {
    authenticate,
    getDataStack,
    isInitailized
};